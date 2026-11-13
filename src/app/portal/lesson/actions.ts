'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { LearningFormatSchema } from '@/core/domain/vocab';
import { requireUser } from '@/lib/auth';
import { FORMAT_LABEL } from '@/lib/labels';
import { rememberFormat } from '@/lib/rememberFormat';
import { classFor, school } from '@/lib/school';

const ResourceIdSchema = z.string().regex(/^R-\d{3}$/);
const LessonSchema = z.object({ resourceId: ResourceIdSchema, format: LearningFormatSchema });
const NOTE_MAX = 4000;
const NoteSchema = z.object({ resourceId: ResourceIdSchema, text: z.string().max(NOTE_MAX) });

/** Saves the learner's own notes for a lesson. */
export async function saveLessonNoteAction(
  resourceId: unknown,
  text: unknown,
): Promise<{ message: string }> {
  const user = await requireUser(['learner']);
  const parsed = NoteSchema.safeParse({ resourceId, text });
  if (!parsed.success) {
    return { message: `Notes can be up to ${NOTE_MAX} characters.` };
  }
  const { notes } = await school();
  await notes.saveLessonNote({ learnerId: user.id, ...parsed.data });
  return { message: '✓ Saved' };
}

/** "Did this help?" on a lesson: a note for Thuso, and a format that helped moves to the front. */
export async function lessonFeedbackAction(
  lesson: unknown,
  helped: unknown,
): Promise<{ message: string }> {
  const user = await requireUser(['learner']);
  const parsed = LessonSchema.safeParse(lesson);
  if (!parsed.success || typeof helped !== 'boolean' || user.grade === null) {
    return { message: 'Something was off — try again.' };
  }
  const { resourceId, format } = parsed.data;
  const resource = (await classFor(user.grade)).resources.find((r) => r.id === resourceId);
  if (!resource) {
    return { message: 'That lesson is not in your grade.' };
  }
  const { notes } = await school();
  await notes.add({
    id: randomUUID(),
    learnerId: user.id,
    question: `${resource.title} as ${FORMAT_LABEL[format].toLowerCase()}`,
    answer: helped ? '👍 helped' : '👎 not yet',
  });
  if (helped) {
    await rememberFormat(user.id, user.grade, format);
  }
  revalidatePath('/portal/learner');
  return {
    message: helped
      ? 'Great — I’ll keep teaching you this way.'
      : 'Thanks for telling me. Try it another way below — I’ll remember what works.',
  };
}
