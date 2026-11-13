import { z } from 'zod';
import { GOAL_MAX_CHARS } from '@/core/config/constants';
import { startRun } from '@/lib/runService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  goal: z.string().trim().min(1).max(GOAL_MAX_CHARS),
  grade: z.number().int().min(10).max(12).default(10),
});

const HTTP_ACCEPTED = 202;
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY = 429;
const HTTP_SERVER_ERROR = 500;

/** POST /api/runs — starts a run for the given goal and returns its id. */
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
    return Response.json(started, { status: HTTP_ACCEPTED });
  } catch {
    // Configuration problems are logged by the server; the client gets no internals.
    return Response.json(
      { error: 'The colleague could not start. Check the server configuration.' },
      { status: HTTP_SERVER_ERROR },
    );
  }
}
