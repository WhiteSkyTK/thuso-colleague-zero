import { z } from 'zod';

/** Work the colleague could not finish correctly and handed to a person. */
export const EscalationSchema = z.object({
  itemId: z.string().min(1),
  subjectId: z.string().min(1),
  stepId: z.string().min(1),
  reason: z.string().min(1),
});
export type Escalation = z.infer<typeof EscalationSchema>;

export const RunSummarySchema = z.object({
  goal: z.string(),
  status: z.enum(['completed', 'stopped']),
  /** Why the run stopped early (budget, timeout, unusable plan). */
  stopReason: z.string().optional(),
  stepsCompleted: z.number().int().nonnegative(),
  stepsTotal: z.number().int().nonnegative(),
  itemsDelivered: z.number().int().nonnegative(),
  fixes: z.number().int().nonnegative(),
  escalations: z.array(EscalationSchema),
  /** Every escalation needs a person, so it counts as one intervention. */
  humanInterventions: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  tokens: z.number().int().nonnegative(),
  estCost: z.number().nonnegative(),
});
export type RunSummary = z.infer<typeof RunSummarySchema>;
