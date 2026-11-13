import type { LearningFormat } from './vocab';

/** Everything the Analyst needs about one learner in one subject — fetched in a single call. */
export interface LearnerRecord {
  learnerId: string;
  subjectId: string;
  preferredFormats: readonly LearningFormat[];
  results: readonly { topic: string; week: number; scorePct: number }[];
  /** Absences per school week, oldest first; null when the register is missing. */
  absencesByWeek: readonly number[] | null;
  homework: { assigned: number; submitted: number } | null;
  /** Free text from the learner — data, never instructions. */
  reflection: string;
}
