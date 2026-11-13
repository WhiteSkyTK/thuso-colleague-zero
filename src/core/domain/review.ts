import { z } from 'zod';

export const CheckResultSchema = z.object({
  checkId: z.string().min(1),
  passed: z.boolean(),
  severity: z.enum(['error', 'warn']),
  /** The fact that proves the result, e.g. "9 absences in 6 weeks". */
  evidence: z.string(),
  /** A concrete instruction for the agent that must fix it. Empty when passed. */
  fixHint: z.string(),
});
export type CheckResult = z.infer<typeof CheckResultSchema>;

export const ReviewVerdictSchema = z.object({
  status: z.enum(['pass', 'fail']),
  issues: z.array(CheckResultSchema),
  fixInstructions: z.string().optional(),
});
export type ReviewVerdict = z.infer<typeof ReviewVerdictSchema>;
