'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { z } from 'zod';
import { AgentEventSchema } from '@/core/domain/agentEvent';
import { INITIAL_RUN_VIEW, runViewReducer, type RunView } from '@/lib/runView';

const ErrorSchema = z.object({ error: z.string() });
const FALLBACK_ERROR = 'The run could not start.';
const LOST_CONNECTION = 'Lost the connection to the run.';
const FRAME_END = '\n\n';
const DATA_PREFIX = 'data: ';

async function readError(response: Response): Promise<string> {
  const parsed = ErrorSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data.error : FALLBACK_ERROR;
}

/** Splits a Server-Sent Events buffer into complete `data:` payloads and the unfinished rest. */
export function takeFrames(buffer: string): { payloads: string[]; rest: string } {
  const frames = buffer.split(FRAME_END);
  const rest = frames.pop() ?? '';
  const payloads = frames.flatMap((frame) =>
    frame
      .split('\n')
      .filter((line) => line.startsWith(DATA_PREFIX))
      .map((line) => line.slice(DATA_PREFIX.length)),
  );
  return { payloads, rest };
}

/**
 * Starts a run and reads its agent log from the same response (works on serverless hosts,
 * where a second request may reach another instance). All screen state comes from the reducer.
 */
export function useRunStream(grade: number): {
  view: RunView;
  start: (goal: string) => Promise<void>;
} {
  const [view, dispatch] = useReducer(runViewReducer, INITIAL_RUN_VIEW);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (goal: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: 'started' });
      try {
        const response = await fetch('/api/runs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal, grade }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          dispatch({ type: 'failed', message: await readError(response) });
          return;
        }
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        const pump = async (buffer: string): Promise<void> => {
          const chunk = await reader.read();
          if (chunk.done) {
            return;
          }
          const { payloads, rest } = takeFrames(buffer + chunk.value);
          for (const payload of payloads) {
            const parsed = AgentEventSchema.safeParse(JSON.parse(payload));
            if (parsed.success) {
              dispatch({ type: 'event', event: parsed.data });
            }
          }
          return pump(rest);
        };
        await pump('');
      } catch {
        if (!controller.signal.aborted) {
          dispatch({ type: 'failed', message: LOST_CONNECTION });
        }
      }
    },
    [grade],
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  return { view, start };
}
