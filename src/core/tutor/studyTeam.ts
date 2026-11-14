import type { LearningFormat, RiskCause } from '../domain/vocab';
import type { LearnerProfile, SubjectStanding } from '../insights/learnerProfile';
import { PLAN_CHECKS, type DraftDay, type LearnerAsks } from './planChecks';

export type TeamAgent = 'PL' | 'AN' | 'CO' | 'RV' | 'MS';
export type TeamLevel = 'PLAN' | 'ACT' | 'FLAG' | 'FIX' | 'PASS' | 'DONE';

export interface TeamEvent {
  agent: TeamAgent;
  level: TeamLevel;
  message: string;
}

/** One finished day of the plan, as the learner sees it. */
export interface TeamDay {
  day: string;
  subjectName: string;
  resourceId: string;
  title: string;
  format: LearningFormat;
  minutes: number;
  task: string;
}

export interface StudyTeamResult {
  events: TeamEvent[];
  days: TeamDay[];
  /** The subject the plan is mostly about (its teacher is told). */
  focusSubjectId?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const MAX_ROUNDS = 4;
const TASKS = [
  'Do the lesson and write it in your notes',
  'Make questions until you get 3 in a row',
];
const CAUSE_SHORT: Record<RiskCause, string> = {
  attendance: 'missed lessons',
  homework: 'homework not done',
  'assessment-trend': 'marks dropping',
  'topic-gap': 'one weak topic',
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const byNeed = (a: SubjectStanding, b: SubjectStanding) =>
  Number(b.isAtRisk) - Number(a.isAtRisk) || a.averagePct - b.averagePct;

/** The Coach's first draft: lessons in turn from the focus subjects, in catalogue order. */
function draftPlan(focus: readonly SubjectStanding[]): DraftDay[] {
  const picks = focus.flatMap((subject, s) =>
    subject.suggestions.map((resource, at) => ({
      subject,
      resource,
      order: at * focus.length + s,
    })),
  );
  return picks
    .sort((a, b) => a.order - b.order)
    .slice(0, DAYS.length)
    .map(({ subject, resource }, at) => ({
      subject,
      resource,
      format: resource.format,
      minutes: resource.minutes,
      task: TASKS[at % TASKS.length] ?? TASKS[0]!,
    }));
}

/** Reviewer ↔ Coach: check, fix with evidence, check again — at most MAX_ROUNDS fixes. */
function reviewLoop(draft: DraftDay[], asks: LearnerAsks, events: TeamEvent[]): DraftDay[] {
  let days = draft;
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const issue = PLAN_CHECKS.map((check) => check(days, asks)).find(Boolean);
    if (!issue) {
      events.push({
        agent: 'RV',
        level: 'PASS',
        message:
          'All checks pass: real cause first, the right level, time per day, formats that help.',
      });
      return days;
    }
    events.push({ agent: 'RV', level: 'FLAG', message: issue.flag });
    const fixed = issue.fix(days);
    days = fixed.days;
    events.push({ agent: 'CO', level: 'FIX', message: fixed.note });
  }
  const left = PLAN_CHECKS.map((check) => check(days, asks)).find(Boolean);
  events.push(
    left
      ? {
          agent: 'RV',
          level: 'FLAG',
          message: `Still not right after ${MAX_ROUNDS} fixes: ${left.flag} Your teacher will take a look.`,
        }
      : { agent: 'RV', level: 'PASS', message: 'Checked again after the fixes — all checks pass.' },
  );
  return days;
}

/**
 * The learner's own study team: Planner, Analyst, Coach, Reviewer and Messenger build a 5-day
 * plan from the learner's marks and from what they told Thuso. Deterministic and logged.
 */
export function runStudyTeam(profile: LearnerProfile, asks: LearnerAsks): StudyTeamResult {
  const first = asks.firstName;
  const events: TeamEvent[] = [
    {
      agent: 'PL',
      level: 'PLAN',
      message: `Goal: a 5-day plan for ${first}. Analyst finds the focus → Coach drafts → Reviewer checks it against what ${first} told me → Messenger delivers.`,
    },
  ];
  if (asks.feeling) {
    events.push({
      agent: 'PL',
      level: 'PLAN',
      message: `${first} said they feel “${asks.feeling}” this week, and has ${asks.minutesPerDay} min a day.`,
    });
  }
  const focus = [...profile.subjects]
    .filter((s) => s.suggestions.length > 0)
    .sort(byNeed)
    .slice(0, 2);
  if (focus.length === 0) {
    events.push({
      agent: 'AN',
      level: 'DONE',
      message: `No marks yet for ${first} — nothing to plan until the first tests are in.`,
    });
    return { events, days: [] };
  }
  for (const s of focus) {
    events.push({
      agent: 'AN',
      level: 'ACT',
      message: `${s.subjectName}: ${s.averagePct}% — ${CAUSE_SHORT[s.risk.primaryCause]} (${s.risk.evidence}).`,
    });
  }
  const draft = draftPlan(focus);
  events.push({
    agent: 'CO',
    level: 'ACT',
    message: `Drafted ${draft.length} days from ${focus.map((s) => s.subjectName).join(' and ')}.`,
  });
  const days = reviewLoop(draft, asks, events).map((d, at) => ({
    day: DAYS[at] ?? `Day ${at + 1}`,
    subjectName: d.subject.subjectName,
    resourceId: d.resource.id,
    // A lesson the Coach moved to another format is named by its topic, not its old format.
    title: d.format === d.resource.format ? d.resource.title : capitalise(d.resource.topic),
    format: d.format,
    minutes: d.minutes,
    task: d.task,
  }));
  events.push({
    agent: 'MS',
    level: 'DONE',
    message: `Plan saved on ${first}’s page, and the ${focus[0]?.subjectName} teacher was told.`,
  });
  return { events, days, focusSubjectId: focus[0]?.subjectId };
}
