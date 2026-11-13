import { z } from 'zod';
import { AgentCodeSchema } from './codes';

export const PlanStepSchema = z.object({
  id: z.string().min(1),
  agent: AgentCodeSchema,
  /** Name of an action the agent offers (see AgentRegistry.catalogue). */
  action: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  successCriteria: z.array(z.string()),
  /** Ids of earlier steps whose output this step consumes. */
  dependsOn: z.array(z.string()),
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

/** What the Planner model returns; the goal id is added in code. */
export const PlanDraftSchema = z.object({
  steps: z.array(PlanStepSchema).min(1),
  rationale: z.string().min(1),
});
export type PlanDraft = z.infer<typeof PlanDraftSchema>;

export const PlanSchema = PlanDraftSchema.extend({ goalId: z.string().min(1) });
export type Plan = z.infer<typeof PlanSchema>;
