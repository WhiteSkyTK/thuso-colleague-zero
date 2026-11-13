import { z } from 'zod';
import { runEventStream } from '@/lib/runEventStream';
import { hasRun } from '@/lib/runService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RunIdSchema = z.uuid();
const HTTP_NOT_FOUND = 404;

/** GET /api/runs/:id/stream — re-open a run's agent log (same server only, e.g. a second tab). */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  if (!RunIdSchema.safeParse(id).success || !hasRun(id)) {
    return Response.json({ error: 'Run not found.' }, { status: HTTP_NOT_FOUND });
  }
  return runEventStream(request, id);
}
