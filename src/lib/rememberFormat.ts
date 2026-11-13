import { updatedFormats } from '@/core/assistant/checkIns';
import type { LearningFormat } from '@/core/domain/vocab';
import { classFor, forgetClass, school } from './school';

/** A learner said a format works for them: it moves to the front, and every cached view refreshes. */
export async function rememberFormat(
  learnerId: string,
  grade: number,
  format: LearningFormat,
): Promise<void> {
  const { users, data } = await school();
  const learner = (await classFor(grade)).learners.find((l) => l.id === learnerId);
  await users.updateFormats(learnerId, updatedFormats(learner?.preferredFormats ?? [], format));
  await data.touch(grade);
  forgetClass(grade);
}
