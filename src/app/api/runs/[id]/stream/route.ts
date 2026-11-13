import { z } from 'zod';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { isFinalEvent } from '@/core/events/TraceRecorder';
import { followRun, hasRun } from '@/lib/runService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RunIdSchema = z.string().uuid();
const HTTP_NOT_FOUND = 404;

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
} as const;

/** GET /api/runs/:id/stream — the run's agent log as Server-Sent Events. */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  if (!RunIdSchema.safeParse(id).success || !hasRun(id)) {
    return Response.json({ error: 'Run not found.' }, { status: HTTP_NOT_FOUND });
  }

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
      stopFollowing = followRun(id, send);
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
