import { fail, pass, type ReviewCheck } from './ReviewCheck';

const ID = 'workload';
const DAYS_PER_WEEK = 7;
const MINUTES_PER_HOUR = 60;

/** A catch-up plan must fit into a learner's week (PLAN_MAX_HOURS_PER_WEEK). */
export const workloadCheck: ReviewCheck = ({ plan, constraints }) => {
  const limit = constraints.maxHoursPerWeek * MINUTES_PER_HOUR;
  const minutesByWeek = new Map<number, number>();
  for (const session of plan.sessions) {
    const week = Math.ceil(session.day / DAYS_PER_WEEK);
    minutesByWeek.set(week, (minutesByWeek.get(week) ?? 0) + session.minutes);
  }
  const over = [...minutesByWeek].find(([, minutes]) => minutes > limit);
  if (!over) {
    return pass(ID);
  }
  const [week, minutes] = over;
  return fail(
    ID,
    `week ${week} asks for ${minutes} minutes; the limit is ${limit}`,
    `Cut week ${week} to at most ${limit} minutes.`,
  );
};
