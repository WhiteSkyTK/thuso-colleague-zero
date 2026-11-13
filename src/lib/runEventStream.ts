import type { AgentEvent } from '@/core/domain/agentEvent';
import { isFinalEvent } from '@/core/events/TraceRecorder';
import { followRun } from './runService';

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
} as const;

/**
 * A run's agent log as Server-Sent Events: what was recorded so far, then live, closing after the
 * final event. Serving it from the same request that started the run keeps hosted (serverless)
 * runs on one instance and alive until the work is delivered.
 */
export function runEventStream(request: Request, runId: string): Response {
  const encoder = new TextEncoder();
  let isOpen = true;
  let stopFollowing = (): void => undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: AgentEvent): void => {
        if (!isOpen) {
          return;
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        if (isFinalEvent(event)) {
          isOpen = false;
          controller.close();
        }
      };
      stopFollowing = followRun(runId, send);
      request.signal.addEventListener('abort', () => {
        isOpen = false;
        stopFollowing();
      });
    },
    cancel() {
      isOpen = false;
      stopFollowing();
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
