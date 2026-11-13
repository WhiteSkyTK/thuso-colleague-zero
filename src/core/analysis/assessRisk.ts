import { looksLikeInstruction } from '../checks/looksLikeInstruction';
import type { RiskAssessment, RiskSignals, WeakTopic } from '../domain/diagnosis';
import type { LearnerRecord } from '../domain/learnerRecord';
import type { RiskCause } from '../domain/vocab';
import { StepFailedError } from '../errors/AppError';
import { capsLevel } from './capsLevel';

const FULL = 100;
/** Share of the risk score each signal carries, in percent. Marks are the outcome; the rest are early warnings. */
const WEIGHT = { marks: 55, attendance: 15, homework: 15, trend: 15 } as const;
const RECENT_WEEKS = 6;
const POINTS_PER_ABSENCE = 10;
const POINTS_PER_TREND_POINT = 3;
const POINTS_PER_GAP_POINT = 2.5;
const WEAK_BELOW_PCT = 50;
const MAX_WEAK_TOPICS = 3;

type Result = LearnerRecord['results'][number];

interface Facts {
  average: number;
  firstHalf: number;
  secondHalf: number;
  recentAbsences: number | null;
  weakest: Result;
}

const clamp = (value: number): number => Math.min(FULL, Math.max(0, value));
const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0);
const mean = (values: readonly number[]): number =>
  values.length === 0 ? 0 : sum(values) / values.length;

function factsOf(record: LearnerRecord): Facts {
  const ordered = [...record.results].sort((a, b) => a.week - b.week);
  const first = ordered[0];
  if (!first) {
    throw new StepFailedError(`${record.learnerId} has no results in ${record.subjectId}`);
  }
  const scores = ordered.map((result) => result.scorePct);
  const half = Math.floor(scores.length / 2);
  return {
    average: mean(scores),
    firstHalf: mean(scores.slice(0, half)),
    secondHalf: mean(scores.slice(half)),
    recentAbsences: record.absencesByWeek ? sum(record.absencesByWeek.slice(-RECENT_WEEKS)) : null,
    weakest: ordered.reduce((lowest, next) => (next.scorePct < lowest.scorePct ? next : lowest), first),
  };
}

function signalsOf(record: LearnerRecord, facts: Facts): RiskSignals {
  const { homework } = record;
  return {
    marks: clamp(FULL - facts.average),
    attendance:
      facts.recentAbsences === null ? null : clamp(facts.recentAbsences * POINTS_PER_ABSENCE),
    homework: homework ? clamp(FULL * (1 - homework.submitted / homework.assigned)) : 0,
    trend: clamp((facts.firstHalf - facts.secondHalf) * POINTS_PER_TREND_POINT),
    topicGap: clamp((facts.average - facts.weakest.scorePct) * POINTS_PER_GAP_POINT),
  };
}

function riskScoreOf(signals: RiskSignals): number {
  const weighted =
    WEIGHT.marks * signals.marks +
    WEIGHT.attendance * (signals.attendance ?? 0) +
    WEIGHT.homework * signals.homework +
    WEIGHT.trend * signals.trend;
  return Math.round(weighted / FULL);
}

/** The root cause is the strongest warning signal — worked out in code, never guessed by a model. */
function causeOf(signals: RiskSignals): RiskCause {
  const ranked: [RiskCause, number][] = [
    ['attendance', signals.attendance ?? 0],
    ['homework', signals.homework],
    ['assessment-trend', signals.trend],
    ['topic-gap', signals.topicGap],
  ];
  return ranked.reduce((top, next) => (next[1] > top[1] ? next : top))[0];
}

const EVIDENCE: Record<RiskCause, (record: LearnerRecord, facts: Facts) => string> = {
  attendance: (_record, facts) =>
    `${facts.recentAbsences ?? 0} absences in the last ${RECENT_WEEKS} weeks`,
  homework: (record) =>
    `${record.homework?.submitted ?? 0} of ${record.homework?.assigned ?? 0} homework tasks handed in`,
  'assessment-trend': (_record, facts) =>
    `average fell from ${Math.round(facts.firstHalf)}% to ${Math.round(facts.secondHalf)}% over the term`,
  'topic-gap': (_record, facts) =>
    `${facts.weakest.topic} at ${facts.weakest.scorePct}% against a ${Math.round(facts.average)}% average`,
};

function weakTopicsOf(record: LearnerRecord): WeakTopic[] {
  const ranked = [...record.results].sort((a, b) => a.scorePct - b.scorePct);
  const below = ranked.filter((result) => result.scorePct < WEAK_BELOW_PCT);
  const picked = below.length > 0 ? below.slice(0, MAX_WEAK_TOPICS) : ranked.slice(0, 1);
  return picked.map((result) => ({
    topic: result.topic,
    scorePct: result.scorePct,
    capsLevel: capsLevel(result.scorePct).level,
  }));
}

/**
 * Scores one learner's risk in one subject and names the root cause, with the
 * evidence for it. Pure and deterministic: the learner's own text cannot change it.
 */
export function assessRisk(record: LearnerRecord): RiskAssessment {
  const facts = factsOf(record);
  const signals = signalsOf(record, facts);
  const primaryCause = causeOf(signals);
  return {
    learnerId: record.learnerId,
    subjectId: record.subjectId,
    riskScore: riskScoreOf(signals),
    signals,
    primaryCause,
    evidence: EVIDENCE[primaryCause](record, facts),
    weakTopics: weakTopicsOf(record),
    preferredFormats: [...record.preferredFormats],
    dataGaps: record.absencesByWeek === null ? ['attendance'] : [],
    hasSuspectText: looksLikeInstruction(record.reflection),
  };
}
