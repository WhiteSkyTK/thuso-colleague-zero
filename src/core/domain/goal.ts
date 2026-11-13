import { z } from 'zod';
import { GOAL_MAX_CHARS } from '../config/constants';

export const GoalConstraintsSchema = z.object({
  /** Risk score (0–100) at or above which a learner counts as at risk. */
  riskThreshold: z.number().min(0).max(100),
  /** Most catch-up work a plan may ask of a learner in one week. */
  maxHoursPerWeek: z.number().positive(),
});
export type GoalConstraints = z.infer<typeof GoalConstraintsSchema>;

/** The outcome a person asks for — not step-by-step instructions. */
export const GoalSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1).max(GOAL_MAX_CHARS),
  constraints: GoalConstraintsSchema,
  createdAt: z.string().min(1),
});
export type Goal = z.infer<typeof GoalSchema>;
