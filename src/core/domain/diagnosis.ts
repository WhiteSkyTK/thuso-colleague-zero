import { z } from 'zod';

/** Pseudonymous learner id — the only learner identifier sent to the model or the log. */
export const LearnerIdSchema = z.string().regex(/^L-\d{3}$/);

export const RISK_CAUSES = ['attendance', 'topic-gap', 'homework', 'assessment-trend'] as const;
export const RiskCauseSchema = z.enum(RISK_CAUSES);
export type RiskCause = z.infer<typeof RiskCauseSchema>;

/** The Analyst's finding for one at-risk learner. */
export const DiagnosisSchema = z.object({
  learnerId: LearnerIdSchema,
  riskScore: z.number().min(0).max(100),
  primaryCause: RiskCauseSchema,
  /** The fact behind the primary cause, e.g. "9 absences in 6 weeks". */
  evidence: z.string().min(1),
  weakTopics: z.array(z.string()),
});
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
