import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'privacy';
const LEARNER_ID = /L-\d{3}/g;

/** No message may mention another learner (POPIA). */
export const privacyCheck: ReviewCheck = ({ plan }) => {
  const text = [plan.summary, plan.learnerMessage, plan.guardianMessage].join(' ');
  const others = [...new Set(text.match(LEARNER_ID) ?? [])].filter((id) => id !== plan.learnerId);
  if (others.length === 0) {
    return pass(ID);
  }
  return fail(
    ID,
    `a message mentions another learner (${others.join(', ')})`,
    'Remove every mention of other learners from the summary and both messages.',
  );
};
