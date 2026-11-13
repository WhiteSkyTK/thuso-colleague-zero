'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { PastPaperInputSchema } from '@/core/school/PastPaperRepository';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';
import type { ActionResult } from '../teacher/actions';

const SaveSchema = PastPaperInputSchema.extend({ id: z.uuid().optional() });
const DeleteSchema = z.object({ id: z.uuid(), grade: z.number().int(), subjectId: z.string() });

/** Teachers may change papers only for what they teach; the principal and admin for every grade. */
async function mayEdit(grade: number, subjectId: string): Promise<string | undefined> {
  const user = await requireUser(['teacher', 'principal', 'admin']);
  if (user.role !== 'teacher') {
    return user.id;
  }
  const { users } = await school();
  const teaching = await users.teachingOf(user.id);
  return teaching.some((t) => t.grade === grade && t.subjectId === subjectId) ? user.id : undefined;
}

export async function savePaperAction(input: unknown): Promise<ActionResult> {
  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Check the year, the title and that both links start with https://.' };
  }
  const { id, ...paper } = parsed.data;
  const userId = await mayEdit(paper.grade, paper.subjectId);
  if (!userId) {
    return { error: 'You can only change papers for the subjects you teach.' };
  }
  const { papers } = await school();
  if (id) {
    const isUpdated = await papers.update(id, paper);
    revalidatePath('/portal/papers');
    return isUpdated
      ? { message: `${paper.title} updated.` }
      : { error: 'That paper no longer exists.' };
  }
  await papers.add(randomUUID(), paper, userId);
  revalidatePath('/portal/papers');
  return { message: `${paper.title} added. Learners can open it now.` };
}

export async function deletePaperAction(input: unknown): Promise<ActionResult> {
  const parsed = DeleteSchema.safeParse(input);
  if (!parsed.success || !(await mayEdit(parsed.data.grade, parsed.data.subjectId))) {
    return { error: 'You can only remove papers for the subjects you teach.' };
  }
  const { papers } = await school();
  const isRemoved = await papers.remove(parsed.data.id);
  revalidatePath('/portal/papers');
  return isRemoved ? { message: 'Paper removed.' } : { error: 'That paper no longer exists.' };
}
