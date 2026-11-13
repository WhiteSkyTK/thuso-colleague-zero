import type { ReviewCheck } from './ReviewCheck';

/**
 * Prompt-injection guard. A warning, not a failure: the plan is still delivered,
 * because the learner's text was withheld from the model and cannot change the score.
 */
export const suspectTextCheck: ReviewCheck = ({ diagnosis }) => ({
  checkId: 'suspect-text',
  passed: !diagnosis.hasSuspectText,
  severity: 'warn',
  evidence: diagnosis.hasSuspectText
    ? `the reflection contains an instruction-like line; it was treated as data and the risk score stays ${diagnosis.riskScore}`
    : '',
  fixHint: '',
});
