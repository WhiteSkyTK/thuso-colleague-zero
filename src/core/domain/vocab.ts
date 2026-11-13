import { z } from 'zod';

/** Pseudonymous learner id — the only learner identifier sent to the model or the log. */
export const LearnerIdSchema = z.string().regex(/^L-\d{3}$/);

/** Why a learner is slipping. Decided in code from the evidence, never by the model. */
export const RISK_CAUSES = ['attendance', 'homework', 'assessment-trend', 'topic-gap'] as const;
export const RiskCauseSchema = z.enum(RISK_CAUSES);
export type RiskCause = z.infer<typeof RiskCauseSchema>;

/**
 * Ways to teach the same idea. A learner says which they like; that is a
 * starting point for the plan, not a label on the learner.
 */
export const LEARNING_FORMATS = [
  'worked-examples',
  'patterns',
  'visual-story',
  'audio',
  'practice',
] as const;
export const LearningFormatSchema = z.enum(LEARNING_FORMATS);
export type LearningFormat = z.infer<typeof LearningFormatSchema>;

/** The scaffold ladder: a topic is built up rung by rung, from basics to exam questions. */
export const SCAFFOLD_RUNGS = ['foundation', 'guided', 'independent', 'exam'] as const;
export const RungSchema = z.enum(SCAFFOLD_RUNGS);
export type Rung = z.infer<typeof RungSchema>;
