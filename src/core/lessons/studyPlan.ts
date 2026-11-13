import type { Resource } from '../domain/classData';
import type { LearnerProfile, SubjectStanding } from '../insights/learnerProfile';

export interface StudyDay {
  label: string;
  subjectName: string;
  resource: Resource;
  /** What to do with the lesson that day: learn it, practise it, then explain it. */
  task: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const WEEKS = 2;
const TASKS = [
  'Do the lesson and write it in your notes',
  'Make questions until you get 3 in a row',
  'Explain it out loud to someone at home',
] as const;

/** At-risk subjects first, then the lowest average. */
const byNeed = (a: SubjectStanding, b: SubjectStanding) =>
  Number(b.isAtRisk) - Number(a.isAtRisk) || a.averagePct - b.averagePct;

/**
 * A personal two-week plan: one lesson a school day, taken in turn from the learner's weakest
 * subjects, in the formats they learn best with. Each lesson comes back after a few days
 * (spaced practice) to be practised and then explained.
 */
export function buildStudyPlan(profile: LearnerProfile): StudyDay[] {
  const queues = [...profile.subjects]
    .sort(byNeed)
    .filter((s) => s.suggestions.length > 0)
    .slice(0, 3);
  const picks: { subjectName: string; resource: Resource }[] = [];
  const longest = Math.max(0, ...queues.map((s) => s.suggestions.length));
  for (let at = 0; at < longest; at += 1) {
    for (const subject of queues) {
      const resource = subject.suggestions[at];
      if (resource) {
        picks.push({ subjectName: subject.subjectName, resource });
      }
    }
  }
  const total = DAYS.length * WEEKS;
  return Array.from({ length: total }, (_, day) => day).flatMap((day) => {
    const pick = picks[day % picks.length];
    if (!pick) {
      return [];
    }
    const round = Math.floor(day / picks.length);
    return [
      {
        label: `Week ${Math.floor(day / DAYS.length) + 1} · ${DAYS[day % DAYS.length]}`,
        ...pick,
        task: TASKS[Math.min(round, TASKS.length - 1)],
      },
    ];
  });
}
