import type { ReviewCheck } from './ReviewCheck';

/** The plan must lead with the cause the Analyst diagnosed, not just the weakest topic. */
export const causeAddressedCheck: ReviewCheck = ({ plan, diagnosis }) => {
  const leadingCause = plan.addresses[0];
  const passed = leadingCause === diagnosis.primaryCause;
  return {
    checkId: 'cause-addressed',
    passed,
    severity: 'error',
    evidence: passed
      ? `plan leads with ${diagnosis.primaryCause}`
      : `plan targets ${leadingCause}, but ${diagnosis.evidence}`,
    fixHint: passed
      ? ''
      : `Lead the plan with ${diagnosis.primaryCause} (${diagnosis.evidence}) before any topic work.`,
  };
};
