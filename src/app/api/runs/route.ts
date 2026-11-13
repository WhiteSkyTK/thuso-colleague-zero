import { z } from 'zod';
import { GOAL_MAX_CHARS } from '@/core/config/constants';
import { runEventStream } from '@/lib/runEventStream';
import { startRun } from '@/lib/runService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** A real-model run can take a few minutes; the agents run inside this request (seconds). */
export const maxDuration = 300;

const BodySchema = z.object({
  goal: z.string().trim().min(1).max(GOAL_MAX_CHARS),
  grade: z.number().int().min(10).max(12).default(10),
});

const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY = 429;
const HTTP_SERVER_ERROR = 500;

/** POST /api/runs — starts a run for the goal and grade, and streams its agent log back (SSE). */
export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: `Send a goal of 1 to ${GOAL_MAX_CHARS} characters.` },
      { status: HTTP_BAD_REQUEST },
    );
  }
  try {
    const started = await startRun(parsed.data.goal, parsed.data.grade);
    if ('busy' in started) {
      return Response.json(
        { error: 'A run is already in progress. Wait for it to finish.' },
        { status: HTTP_TOO_MANY },
      );
    }
    return runEventStream(request, started.runId);
  } catch {
    // Configuration problems are logged by the server; the client gets no internals.
    return Response.json(
      { error: 'The colleague could not start. Check the server configuration.' },
      { status: HTTP_SERVER_ERROR },
    );
  }
}
