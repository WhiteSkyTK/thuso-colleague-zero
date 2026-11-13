import { z } from 'zod';
import { LearnerIdSchema, LearningFormatSchema, RiskCauseSchema } from './vocab';

const Percent = z.number().min(0).max(100);

export const WeakTopicSchema = z.object({
  topic: z.string().min(1),
  scorePct: Percent,
  /** CAPS achievement level, 1 (not achieved) to 7 (outstanding). */
  capsLevel: z.number().int().min(1).max(7),
});
export type WeakTopic = z.infer<typeof WeakTopicSchema>;

/** Each signal is 0 (fine) to 100 (severe). */
export const RiskSignalsSchema = z.object({
  marks: Percent,
  /** null when the school has no attendance register for the learner. */
  attendance: Percent.nullable(),
  homework: Percent,
  trend: Percent,
  topicGap: Percent,
});
export type RiskSignals = z.infer<typeof RiskSignalsSchema>;

/** What the code works out about one learner in one subject — no model involved. */
export const RiskAssessmentSchema = z.object({
  learnerId: LearnerIdSchema,
  subjectId: z.string().min(1),
  riskScore: Percent,
  signals: RiskSignalsSchema,
  primaryCause: RiskCauseSchema,
  /** The fact behind the primary cause, e.g. "9 absences in the last 6 weeks". */
  evidence: z.string().min(1),
  weakTopics: z.array(WeakTopicSchema).min(1),
  preferredFormats: z.array(LearningFormatSchema).min(1),
  /** Records the school does not have, e.g. "attendance". */
  dataGaps: z.array(z.string()),
  /** The learner's own text looked like an instruction; it was treated as data. */
  hasSuspectText: z.boolean(),
});
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

/** The Analyst's finding: the assessment plus the root cause explained in words. */
export const DiagnosisSchema = RiskAssessmentSchema.extend({ explanation: z.string().min(1) });
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
