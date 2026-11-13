import { z } from 'zod';
import { PLAN_LENGTH_DAYS } from '../config/constants';
import { LearnerIdSchema, LearningFormatSchema, RiskCauseSchema, RungSchema } from './vocab';

export const PlanSessionSchema = z.object({
  /** Day of the plan, 1–14. */
  day: z.number().int().min(1).max(PLAN_LENGTH_DAYS),
  topic: z.string().min(1),
  minutes: z.number().int().positive(),
  /** How the idea is taught in this session. */
  format: LearningFormatSchema,
  /** Where the session sits on the scaffold ladder. */
  rung: RungSchema,
  /** What the learner actually does. */
  activity: z.string().min(1),
  /** Ids from the ResourceCatalog only; empty for a teacher-led session. */
  resourceIds: z.array(z.string()),
});
export type PlanSession = z.infer<typeof PlanSessionSchema>;

export const SupportSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});
export type SupportSession = z.infer<typeof SupportSessionSchema>;

/** The Coach's 2-week catch-up plan for one learner. */
export const CatchUpPlanSchema = z.object({
  learnerId: LearnerIdSchema,
  /** Causes the plan tackles, most important first. */
  addresses: z.array(RiskCauseSchema).min(1),
  summary: z.string().min(1),
  sessions: z.array(PlanSessionSchema).min(1),
  /** The booked face-to-face session with the teacher. */
  supportSession: SupportSessionSchema,
  learnerMessage: z.string().min(1),
  guardianMessage: z.string().min(1),
});
export type CatchUpPlan = z.infer<typeof CatchUpPlanSchema>;
