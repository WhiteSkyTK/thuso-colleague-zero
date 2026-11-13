import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'cause-addressed';

/** The plan must lead with the root cause the Analyst found, not just the weakest topic. */
export const causeAddressedCheck: ReviewCheck = ({ plan, diagnosis }) => {
  const leadingCause = plan.addresses[0];
  if (leadingCause === diagnosis.primaryCause) {
    return pass(ID);
  }
  return fail(
    ID,
    `plan targets ${leadingCause}, but ${diagnosis.evidence}`,
    `Lead the plan with ${diagnosis.primaryCause} (${diagnosis.evidence}) before any topic work.`,
  );
};
