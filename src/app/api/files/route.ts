import { randomUUID } from 'node:crypto';
import { MAX_FILE_BYTES } from '@/core/school/FileRepository';
import { matchesSignature, safeFileName } from '@/core/school/fileSignature';
import { currentUser } from '@/lib/auth';
import { school } from '@/lib/school';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORISED = 401;
const HTTP_TOO_LARGE = 413;
const MB = 1024 * 1024;

const fail = (error: string, status: number) => Response.json({ error }, { status });

/** POST /api/files — a signed-in person uploads one PDF or image (paper, memo or their working). */
export async function POST(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return fail('Sign in to upload files.', HTTP_UNAUTHORISED);
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return fail('Choose a file to upload.', HTTP_BAD_REQUEST);
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail(`Files can be up to ${MAX_FILE_BYTES / MB} MB.`, HTTP_TOO_LARGE);
  }
  const data = Buffer.from(await file.arrayBuffer());
  if (!matchesSignature(file.type, data)) {
    return fail('Upload a PDF, PNG, JPEG or WebP file.', HTTP_BAD_REQUEST);
  }
  const id = randomUUID();
  const { files } = await school();
  await files.save({
    id,
    ownerId: user.id,
    name: safeFileName(file.name),
    contentType: file.type,
    data,
  });
  return Response.json(
    { id, url: `/api/files/${id}`, name: safeFileName(file.name) },
    { status: HTTP_CREATED },
  );
}
