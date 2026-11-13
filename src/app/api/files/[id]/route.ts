import { z } from 'zod';
import { currentUser } from '@/lib/auth';
import { school } from '@/lib/school';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_NOT_FOUND = 404;

/** GET /api/files/:id — school files are for signed-in people only, never public. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([context.params, currentUser()]);
  if (!user || !z.uuid().safeParse(id).success) {
    return new Response('Not found', { status: HTTP_NOT_FOUND });
  }
  const { files } = await school();
  const file = await files.get(id);
  if (!file) {
    return new Response('Not found', { status: HTTP_NOT_FOUND });
  }
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.name.replaceAll('"', '')}"`,
      'Cache-Control': 'private, max-age=300',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
