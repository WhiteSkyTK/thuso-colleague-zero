import { z } from 'zod';
import { currentUser } from '@/lib/auth';
import { school } from '@/lib/school';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_NOT_FOUND = 404;
const NOT_FOUND = () => new Response('Not found', { status: HTTP_NOT_FOUND });

/** GET /portal/messages/:id/invite — the .ics file. Learners get only their own; staff any. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([context.params, currentUser()]);
  if (!user || !z.uuid().safeParse(id).success) {
    return NOT_FOUND();
  }
  const { messages } = await school();
  const found = await messages.invite(id);
  if (!found || (user.role === 'learner' && found.about !== user.id)) {
    return NOT_FOUND();
  }
  return new Response(found.invite, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8; method=REQUEST',
      'Content-Disposition': 'attachment; filename="support-session.ics"',
      'Cache-Control': 'private, no-store',
    },
  });
}
