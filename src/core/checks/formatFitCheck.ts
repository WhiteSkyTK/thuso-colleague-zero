import type { LearningFormat } from '../domain/vocab';
import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'format-fit';
const MIN_SHARE = 0.5;

/** At least half of the sessions must teach the way the learner says they learn best. */
export const formatFitCheck: ReviewCheck = ({ plan, diagnosis }) => {
  const preferred = new Set<LearningFormat>(diagnosis.preferredFormats);
  const matching = plan.sessions.filter((session) => preferred.has(session.format)).length;
  if (matching >= plan.sessions.length * MIN_SHARE) {
    return pass(ID);
  }
  const wanted = diagnosis.preferredFormats.join(' or ');
  return fail(
    ID,
    `${matching} of ${plan.sessions.length} sessions use the learner's preferred format (${wanted})`,
    `Teach at least half of the sessions as ${wanted}.`,
  );
};
