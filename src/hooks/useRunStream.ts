'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { z } from 'zod';
import { AgentEventSchema } from '@/core/domain/agentEvent';
import { isFinalEvent } from '@/core/events/TraceRecorder';
import { INITIAL_RUN_VIEW, runViewReducer, type RunView } from '@/lib/runView';

const StartedSchema = z.object({ runId: z.string().uuid() });
const ErrorSchema = z.object({ error: z.string() });
const FALLBACK_ERROR = 'The run could not start.';
const LOST_CONNECTION = 'Lost the connection to the run.';

async function readError(response: Response): Promise<string> {
  const parsed = ErrorSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data.error : FALLBACK_ERROR;
}

/** Starts a run and follows its event stream. All screen state comes from the reducer. */
export function useRunStream(grade: number): {
  view: RunView;
  start: (goal: string) => Promise<void>;
} {
  const [view, dispatch] = useReducer(runViewReducer, INITIAL_RUN_VIEW);
  const sourceRef = useRef<EventSource | null>(null);

  const follow = useCallback((runId: string) => {
    const source = new EventSource(`/api/runs/${runId}/stream`);
    sourceRef.current = source;
    source.onmessage = (message: MessageEvent<string>) => {
      const parsed = AgentEventSchema.safeParse(JSON.parse(message.data));
      if (!parsed.success) {
        return;
      }
      dispatch({ type: 'event', event: parsed.data });
      if (isFinalEvent(parsed.data)) {
        source.close();
      }
    };
    source.onerror = () => {
      source.close();
      dispatch({ type: 'failed', message: LOST_CONNECTION });
    };
  }, []);

  const start = useCallback(
    async (goal: string) => {
      sourceRef.current?.close();
      dispatch({ type: 'started' });
      try {
        const response = await fetch('/api/runs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal, grade }),
        });
        if (!response.ok) {
          dispatch({ type: 'failed', message: await readError(response) });
          return;
        }
        follow(StartedSchema.parse(await response.json()).runId);
      } catch {
        dispatch({ type: 'failed', message: FALLBACK_ERROR });
      }
    },
    [follow, grade],
  );

  useEffect(() => () => sourceRef.current?.close(), []);

  return { view, start };
}
