import type { Resource } from '../domain/classData';
import type { LearningFormat } from '../domain/vocab';
import type { SubjectStanding } from '../insights/learnerProfile';

/** One day of the draft while the team works on it. */
export interface DraftDay {
  subject: SubjectStanding;
  resource: Resource;
  format: LearningFormat;
  minutes: number;
  task: string;
}

/** What the learner told Thuso, which the Reviewer holds the plan to. */
export interface LearnerAsks {
  firstName: string;
  minutesPerDay: number;
  feeling?: 'confident' | 'okay' | 'lost';
  avoidFormats: readonly LearningFormat[];
  preferredFormats: readonly LearningFormat[];
}

/** A Reviewer finding: what is wrong (with evidence) and how the Coach fixed it. */
export interface PlanIssue {
  flag: string;
  fix: (days: DraftDay[]) => { days: DraftDay[]; note: string };
}

export const CATCH_UP_TASK = 'Copy the notes from the lessons you missed first, then do the lesson';
const SPLIT_TASK = 'Do the first half today and finish it tomorrow';

/** No day may take longer than the time the learner said they have. */
export function workloadCheck(days: readonly DraftDay[], asks: LearnerAsks): PlanIssue | undefined {
  const tooLong = days.findIndex((d) => d.minutes > asks.minutesPerDay);
  const day = days[tooLong];
  if (!day) {
    return undefined;
  }
  const count = days.filter((d) => d.minutes > asks.minutesPerDay).length;
  return {
    flag: `${count} day(s) are too long — day ${tooLong + 1} takes ${day.minutes} min, but ${asks.firstName} has ${asks.minutesPerDay} min a day.`,
    fix: (all) => ({
      days: all.map((d) => (d.minutes > asks.minutesPerDay ? shortened(d, asks.minutesPerDay) : d)),
      note: `Swapped in shorter lessons, or split them over two days, so every day fits ${asks.minutesPerDay} min.`,
    }),
  };
}

/** A shorter lesson on the same topic, or the same lesson split over two days. */
function shortened(day: DraftDay, minutes: number): DraftDay {
  const shorter = day.subject.suggestions.find(
    (r) => r.topic === day.resource.topic && r.minutes <= minutes,
  );
  return shorter
    ? { ...day, resource: shorter, minutes: shorter.minutes }
    : { ...day, minutes, task: day.task === CATCH_UP_TASK ? day.task : SPLIT_TASK };
}

/** A learner who feels lost starts at the bottom of the ladder. */
export function gentleStartCheck(
  days: readonly DraftDay[],
  asks: LearnerAsks,
): PlanIssue | undefined {
  const first = days[0];
  if (asks.feeling !== 'lost' || !first || first.resource.rung === 'foundation') {
    return undefined;
  }
  const easier = days.findIndex((d) => d.resource.rung === 'foundation');
  return {
    flag: `${asks.firstName} said they feel lost, but day 1 starts at “${first.resource.rung}” level.`,
    fix: (all) => {
      if (easier < 0) {
        return { days: all, note: 'No easier lesson exists yet — the teacher was told.' };
      }
      const reordered = [all[easier], ...all.filter((_, at) => at !== easier)].filter(
        (d): d is DraftDay => d !== undefined,
      );
      return { days: reordered, note: `Moved the start-here lesson to day 1.` };
    },
  };
}

/** Never teach in a format the learner said did not help. */
export function formatCheck(days: readonly DraftDay[], asks: LearnerAsks): PlanIssue | undefined {
  const bad = days.findIndex((d) => asks.avoidFormats.includes(d.format));
  const day = days[bad];
  if (!day) {
    return undefined;
  }
  const better =
    asks.preferredFormats.find((f) => !asks.avoidFormats.includes(f)) ?? 'worked-examples';
  return {
    flag: `Day ${bad + 1} is a ${day.format.replace('-', ' ')} lesson, but ${asks.firstName} said that format did not help.`,
    fix: (all) => ({
      days: all.map((d) => (asks.avoidFormats.includes(d.format) ? { ...d, format: better } : d)),
      note: `Those days now teach as ${better.replace('-', ' ')}.`,
    }),
  };
}

/** The plan starts with the real reason the learner is slipping. */
export function causeCheck(days: readonly DraftDay[], asks: LearnerAsks): PlanIssue | undefined {
  const first = days[0];
  if (!first) {
    return undefined;
  }
  const { risk } = first.subject;
  if (risk.primaryCause === 'attendance' && first.task !== CATCH_UP_TASK) {
    return {
      flag: `${asks.firstName}’s main problem is missed lessons (${risk.evidence}), but day 1 skips them.`,
      fix: (all) => ({
        days: all.map((d, at) => (at === 0 ? { ...d, task: CATCH_UP_TASK } : d)),
        note: 'Day 1 now starts by catching up on the missed lessons.',
      }),
    };
  }
  const weak = risk.weakTopics[0]?.topic;
  const onWeak = first.subject.suggestions.find((r) => r.topic === weak);
  if (risk.primaryCause === 'topic-gap' && onWeak && first.resource.topic !== weak) {
    return {
      flag: `The weak topic is ${weak}, but day 1 is about ${first.resource.topic}.`,
      fix: (all) => ({
        days: all.map((d, at) =>
          at === 0 ? { ...d, resource: onWeak, minutes: onWeak.minutes } : d,
        ),
        note: `Day 1 is now “${onWeak.title}”.`,
      }),
    };
  }
  return undefined;
}

export const PLAN_CHECKS = [causeCheck, gentleStartCheck, workloadCheck, formatCheck] as const;
