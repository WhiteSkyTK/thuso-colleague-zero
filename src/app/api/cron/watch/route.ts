import { timingSafeEqual } from 'node:crypto';
import { runWatch } from '@/lib/alerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_UNAUTHORISED = 401;

function isAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret ?? ''}`;
  // No secret configured means no outside caller may trigger the watch.
  return (
    Boolean(secret) &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

/** GET /api/cron/watch — Vercel Cron calls this every morning: Thuso checks every grade on its own. */
export async function GET(request: Request): Promise<Response> {
  if (!isAuthorised(request)) {
    return new Response('Unauthorised', { status: HTTP_UNAUTHORISED });
  }
  return Response.json(await runWatch());
}
