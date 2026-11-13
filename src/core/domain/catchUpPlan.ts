import { z } from 'zod';
import { PLAN_LENGTH_DAYS } from '../config/constants';
import { LearnerIdSchema, RiskCauseSchema } from './diagnosis';

export const PlanSessionSchema = z.object({
  /** Day of the plan, 1–14. */
  day: z.number().int().min(1).max(PLAN_LENGTH_DAYS),
  topic: z.string().min(1),
  minutes: z.number().int().positive(),
  /** Ids from the ResourceCatalog only. */
  resourceIds: z.array(z.string()),
});
export type PlanSession = z.infer<typeof PlanSessionSchema>;

/** The Coach's 2-week catch-up plan for one learner. */
export const CatchUpPlanSchema = z.object({
  learnerId: LearnerIdSchema,
  /** Causes the plan tackles, most important first. */
  addresses: z.array(RiskCauseSchema).min(1),
  summary: z.string().min(1),
  sessions: z.array(PlanSessionSchema).min(1),
  learnerMessage: z.string().min(1),
  guardianMessage: z.string().min(1),
});
export type CatchUpPlan = z.infer<typeof CatchUpPlanSchema>;
