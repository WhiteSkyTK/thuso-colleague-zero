import { addTask, NewTaskSchema } from '@/lib/classStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;

/** POST /api/tasks — the lecturer adds a task; learners see it on their page. */
export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = NewTaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Give the task a title, a subject, a kind, a week and at least one topic.' },
      { status: HTTP_BAD_REQUEST },
    );
  }
  const result = addTask(parsed.data);
  if ('error' in result) {
    return Response.json(result, { status: HTTP_BAD_REQUEST });
  }
  return Response.json(result, { status: HTTP_CREATED });
}
