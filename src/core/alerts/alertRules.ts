import { assessRisk } from '../analysis/assessRisk';
import type { ClassData } from '../domain/classData';
import type { RiskCause } from '../domain/vocab';
import { InMemoryClassRepository } from '../repositories/InMemoryClassRepository';

/** Below this a single topic mark is worth a nudge, even when the learner is not at risk overall. */
export const LOW_MARK_PCT = 40;

export type AlertKind = 'at-risk' | 'low-mark' | 'plan-ready' | 'run-summary';

/** Something Thuso noticed, before it is addressed to people. */
export interface Alert {
  kind: AlertKind;
  learnerId: string;
  learnerName: string;
  subjectId: string;
  subjectName: string;
  cause?: RiskCause;
  evidence?: string;
  topic?: string;
  scorePct?: number;
}

const CAUSE_TEXT: Record<RiskCause, string> = {
  attendance: 'attendance',
  homework: 'homework not handed in',
  'assessment-trend': 'marks falling',
  'topic-gap': 'one weak topic',
};

function atRiskIds(
  data: ClassData,
  subjectId: string,
  threshold: number,
): Map<string, ReturnType<typeof assessRisk>> {
  const records = new InMemoryClassRepository(data).recordsFor(subjectId);
  return new Map(
    records
      .map(assessRisk)
      .filter((risk) => risk.riskScore >= threshold)
      .map((risk) => [risk.learnerId, risk]),
  );
}

const nameOf = (data: ClassData, learnerId: string) => {
  const learner = data.learners.find((candidate) => candidate.id === learnerId);
  return learner ? `${learner.firstName} ${learner.lastName}` : learnerId;
};

export interface MarkChange {
  before: ClassData;
  after: ClassData;
  subjectId: string;
  topic: string;
  marks: readonly { learnerId: string; scorePct: number }[];
  threshold: number;
}

/** After a mark sheet is saved: who became at risk, and who scored low on this topic. */
export function alertsForMarkChange(change: MarkChange): Alert[] {
  const { before, after, subjectId, topic, marks, threshold } = change;
  const subjectName = after.subjects.find((s) => s.id === subjectId)?.name ?? subjectId;
  const wasAtRisk = atRiskIds(before, subjectId, threshold);
  const nowAtRisk = atRiskIds(after, subjectId, threshold);
  const alerts: Alert[] = [];
  for (const { learnerId, scorePct } of marks) {
    const base = { learnerId, learnerName: nameOf(after, learnerId), subjectId, subjectName };
    const risk = nowAtRisk.get(learnerId);
    if (risk && !wasAtRisk.has(learnerId)) {
      alerts.push({ ...base, kind: 'at-risk', cause: risk.primaryCause, evidence: risk.evidence });
    }
    if (scorePct < LOW_MARK_PCT) {
      alerts.push({ ...base, kind: 'low-mark', topic, scorePct });
    }
  }
  return alerts;
}

/** The daily watch: every learner at risk in a grade, with the root cause. */
export function alertsForWatch(data: ClassData, threshold: number): Alert[] {
  return data.subjects.flatMap((subject) =>
    [...atRiskIds(data, subject.id, threshold).values()].map((risk) => ({
      kind: 'at-risk' as const,
      learnerId: risk.learnerId,
      learnerName: nameOf(data, risk.learnerId),
      subjectId: subject.id,
      subjectName: subject.name,
      cause: risk.primaryCause,
      evidence: risk.evidence,
    })),
  );
}

export interface AlertText {
  forTeacher: { title: string; body: string };
  forLearner?: { title: string; body: string };
}

/** Plain words for each alert: specific, kind, and always with the next step. */
export function describeAlert(alert: Alert): AlertText {
  if (alert.kind === 'at-risk') {
    const why = alert.cause ? CAUSE_TEXT[alert.cause] : 'several signals';
    return {
      forTeacher: {
        title: `${alert.learnerName} is now at risk in ${alert.subjectName}`,
        body: `Root cause: ${why} (${alert.evidence ?? 'see the learner page'}). Let Thuso write a catch-up plan.`,
      },
      forLearner: {
        title: `Let's get ${alert.subjectName} back on track`,
        body: 'Thuso found what is holding you back and picked resources in the way you learn best. Open My page.',
      },
    };
  }
  return {
    forTeacher: {
      title: `${alert.learnerName}: ${alert.scorePct}% in ${alert.topic}`,
      body: `Below ${LOW_MARK_PCT}% in ${alert.subjectName}. Thuso has suggested practice in the learner's format.`,
    },
    forLearner: {
      title: `${alert.topic}: ${alert.scorePct}% — you can fix this`,
      body: `Start with the first resource under "Study next" in ${alert.subjectName}. One short session today helps.`,
    },
  };
}
