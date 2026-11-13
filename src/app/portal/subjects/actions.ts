'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isValidChoice } from '@/core/subjects/nscSubjects';
import { requireUser } from '@/lib/auth';
import { school } from '@/lib/school';
import type { ActionResult } from '../teacher/actions';

const CodesSchema = z.array(z.string().regex(/^[A-Z]{4}$/)).max(12);

/** A learner saves their seven subjects; the NSC rules are checked again on the server. */
export async function saveSubjectsAction(codes: readonly string[]): Promise<ActionResult> {
  const user = await requireUser(['learner']);
  const parsed = CodesSchema.safeParse(codes);
  if (!parsed.success || !isValidChoice(parsed.data)) {
    return { error: 'That choice does not meet the NSC rules yet. Check the list on the right.' };
  }
  const { choices } = await school();
  await choices.save(user.id, parsed.data);
  revalidatePath('/portal', 'layout');
  return { message: 'Saved. Your teachers can see your subjects now.' };
}
