import { assessRisk } from '../analysis/assessRisk';
import type { ClassData } from '../domain/classData';
import type { RiskAssessment } from '../domain/diagnosis';
import type { LearningFormat, RiskCause } from '../domain/vocab';
import { InMemoryClassRepository } from '../repositories/InMemoryClassRepository';

export type CategoryKey =
  'missing-lessons' | 'practice-gap' | 'slipping' | 'topic-gap' | 'watch' | 'steady' | 'thriving';

export interface LearnerCategory {
  key: CategoryKey;
  label: string;
  icon: string;
  /** What helps a learner in this group — for the teacher and the learner. */
  support: string;
}

export const CATEGORIES: Record<CategoryKey, LearnerCategory> = {
  'missing-lessons': {
    key: 'missing-lessons',
    label: 'Missing lessons',
    icon: '📅',
    support: 'Catch up on missed lessons first: short recap sessions and a buddy for notes.',
  },
  'practice-gap': {
    key: 'practice-gap',
    label: 'Practice gap',
    icon: '✎',
    support: 'Little and often: 15 minutes of homework a day, checked the same day.',
  },
  slipping: {
    key: 'slipping',
    label: 'Slipping',
    icon: '↘',
    support: 'Marks fall as topics build: go back to the first gap and rebuild from there.',
  },
  'topic-gap': {
    key: 'topic-gap',
    label: 'One weak topic',
    icon: '◎',
    support: 'Fix the one topic with a scaffold ladder; everything else is on track.',
  },
  watch: {
    key: 'watch',
    label: 'Keep an eye on',
    icon: '👀',
    support: 'Close to the line in a subject: a short check-in this week prevents a slide.',
  },
  steady: {
    key: 'steady',
    label: 'Steady',
    icon: '➜',
    support: 'On track: keep the routine and add a few exam-style questions.',
  },
  thriving: {
    key: 'thriving',
    label: 'Thriving',
    icon: '★',
    support: 'Strong all round: stretch with exam-level and enrichment work.',
  },
};

const CAUSE_CATEGORY: Record<RiskCause, CategoryKey> = {
  attendance: 'missing-lessons',
  homework: 'practice-gap',
  'assessment-trend': 'slipping',
  'topic-gap': 'topic-gap',
};

/** Within this many points of the risk threshold counts as "close to the line". */
const WATCH_MARGIN = 8;
const THRIVING_AVERAGE = 75;
const PROBLEM_SIGNAL = 30;

/** One learner in one subject: the facts every category is built from. */
export interface SubjectSignal {
  subjectId: string;
  subjectName: string;
  averagePct: number;
  risk: RiskAssessment;
}

/** Every learner's signals in every subject, computed once per subject (no N+1). */
export function classSignals(data: ClassData): Map<string, SubjectSignal[]> {
  const repo = new InMemoryClassRepository(data);
  const signals = new Map<string, SubjectSignal[]>();
  for (const subject of data.subjects) {
    for (const record of repo.recordsFor(subject.id)) {
      const scores = record.results.map((result) => result.scorePct);
      const averagePct = Math.round(
        scores.reduce((total, score) => total + score, 0) / Math.max(scores.length, 1),
      );
      const entry = {
        subjectId: subject.id,
        subjectName: subject.name,
        averagePct,
        risk: assessRisk(record),
      };
      signals.set(record.learnerId, [...(signals.get(record.learnerId) ?? []), entry]);
    }
  }
  return signals;
}

/** The learner's group: the most common root cause where they are at risk, otherwise how they are doing. */
export function categorise(signals: readonly SubjectSignal[], threshold: number): LearnerCategory {
  const atRisk = signals.filter((signal) => signal.risk.riskScore >= threshold);
  if (atRisk.length > 0) {
    const counts = Map.groupBy(atRisk, (signal) => signal.risk.primaryCause);
    const [cause] = [...counts].sort((a, b) => b[1].length - a[1].length)[0] ?? [];
    return CATEGORIES[cause ? CAUSE_CATEGORY[cause] : 'watch'];
  }
  if (signals.some((signal) => signal.risk.riskScore >= threshold - WATCH_MARGIN)) {
    return CATEGORIES.watch;
  }
  const overall =
    signals.reduce((total, s) => total + s.averagePct, 0) / Math.max(signals.length, 1);
  return overall >= THRIVING_AVERAGE ? CATEGORIES.thriving : CATEGORIES.steady;
}

/** What Thuso has learned about a learner, in plain words. Updates whenever marks change. */
export function learnedFacts(
  signals: readonly SubjectSignal[],
  formats: readonly LearningFormat[],
): string[] {
  const ranked = [...signals].sort((a, b) => b.averagePct - a.averagePct);
  const best = ranked[0];
  const worst = ranked.at(-1);
  const facts: string[] = [];
  if (best) {
    facts.push(`Strongest subject: ${best.subjectName} (${best.averagePct}%).`);
  }
  if (worst && worst !== best) {
    facts.push(`Needs the most work: ${worst.subjectName} (${worst.averagePct}%).`);
  }
  const homework = Math.max(...signals.map((s) => s.risk.signals.homework), 0);
  facts.push(homework >= PROBLEM_SIGNAL ? 'Misses a lot of homework.' : 'Hands in most homework.');
  const attendance = signals.map((s) => s.risk.signals.attendance).find((value) => value !== null);
  if (attendance === undefined || attendance === null) {
    facts.push('No attendance register on record.');
  } else {
    facts.push(
      attendance >= PROBLEM_SIGNAL
        ? 'Has missed many lessons recently.'
        : 'Comes to class regularly.',
    );
  }
  facts.push(`Learns best with: ${formats.join(', ').replaceAll('-', ' ')}.`);
  return facts;
}

export interface CategorisedLearner {
  learnerId: string;
  name: string;
  category: LearnerCategory;
}

/** Every learner in a grade, grouped — for the teacher's and principal's overview. */
export function categoriseClass(data: ClassData, threshold: number): CategorisedLearner[] {
  const signals = classSignals(data);
  return data.learners.map((learner) => ({
    learnerId: learner.id,
    name: `${learner.firstName} ${learner.lastName}`,
    category: categorise(signals.get(learner.id) ?? [], threshold),
  }));
}
