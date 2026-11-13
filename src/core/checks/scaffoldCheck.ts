import type { CheckResult } from '../domain/review';
import { SCAFFOLD_RUNGS } from '../domain/vocab';
import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'scaffold';
/** CAPS levels 1–2 (below 40%): the learner needs the basics first. */
const NEEDS_FOUNDATION_AT_OR_BELOW = 2;
const ORDER_HINT = 'Keep each topic in order: foundation, guided, independent, exam.';

/** Topics are built up rung by rung: start low enough for the learner and never step down. */
export const scaffoldCheck: ReviewCheck = ({ plan, diagnosis }) => {
  const levelOf = new Map<string, number>(
    diagnosis.weakTopics.map((weak) => [weak.topic, weak.capsLevel]),
  );
  const lastRung = new Map<string, number>();
  const inOrder = [...plan.sessions].sort((a, b) => a.day - b.day);

  const check = (topic: string, rung: number): CheckResult | undefined => {
    const previous = lastRung.get(topic);
    const level = levelOf.get(topic);
    if (
      previous === undefined &&
      rung > 0 &&
      level !== undefined &&
      level <= NEEDS_FOUNDATION_AT_OR_BELOW
    ) {
      return fail(
        ID,
        `${topic} starts at "${SCAFFOLD_RUNGS[rung]}" but the learner is at CAPS level ${level}`,
        `Start ${topic} at the foundation rung. ${ORDER_HINT}`,
      );
    }
    if (previous !== undefined && rung < previous) {
      return fail(
        ID,
        `${topic} steps back from "${SCAFFOLD_RUNGS[previous]}" to "${SCAFFOLD_RUNGS[rung]}"`,
        ORDER_HINT,
      );
    }
    return undefined;
  };

  for (const session of inOrder) {
    const rung = SCAFFOLD_RUNGS.indexOf(session.rung);
    const problem = check(session.topic, rung);
    if (problem) {
      return problem;
    }
    lastRung.set(session.topic, rung);
  }
  return pass(ID);
};
