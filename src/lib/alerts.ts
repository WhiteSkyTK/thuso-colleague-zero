import { randomUUID } from 'node:crypto';
import { alertsForWatch, describeAlert, type Alert } from '@/core/alerts/alertRules';
import type { NewNotification } from '@/core/school/NotificationRepository';
import { GRADES } from '@/core/domain/schoolUser';
import type { RunSummary } from '@/core/domain/runSummary';
import { classFor, school } from './school';

/** Turns alerts into notifications for the subject's teachers and the learner. */
export async function notifyAlerts(grade: number, alerts: readonly Alert[]): Promise<number> {
  const { users, notifications } = await school();
  const subjects = [...new Set(alerts.map((alert) => alert.subjectId))];
  const teacherLists = await Promise.all(
    subjects.map((subjectId) => users.teachersFor(grade, subjectId)),
  );
  const teachersBySubject = new Map(
    subjects.map((subjectId, at) => [subjectId, teacherLists[at] ?? []]),
  );
  const list: NewNotification[] = [];
  for (const alert of alerts) {
    const text = describeAlert(alert);
    const common = { kind: alert.kind, learnerId: alert.learnerId, grade };
    for (const teacherId of teachersBySubject.get(alert.subjectId) ?? []) {
      list.push({
        ...common,
        id: randomUUID(),
        userId: teacherId,
        ...text.forTeacher,
        link: `/portal/learners/${alert.learnerId}`,
      });
    }
    if (text.forLearner) {
      list.push({
        ...common,
        id: randomUUID(),
        userId: alert.learnerId,
        ...text.forLearner,
        link: '/portal/learner',
      });
    }
  }
  return notifications.add(list);
}

/** After a run: each learner hears their plan is ready; teachers and the principal get the summary. */
export async function notifyRunFinished(
  run: { id: string; grade: number; summary: RunSummary; flags: number },
  learnerIds: readonly string[],
): Promise<void> {
  const { users, notifications } = await school();
  const [teachers, principals] = await Promise.all([
    users.teachersOfGrade(run.grade),
    users.idsWithRole('principal'),
  ]);
  const { summary } = run;
  const title = `Thuso delivered ${summary.itemsDelivered} catch-up plans for Grade ${run.grade}`;
  const body = `${run.flags} mistakes caught, ${summary.fixes} fixed by the Reviewer, human interventions: ${summary.humanInterventions}.`;
  await notifications.add([
    ...learnerIds.map((learnerId) => ({
      id: randomUUID(),
      userId: learnerId,
      kind: 'plan-ready' as const,
      title: 'Your catch-up plan is ready',
      body: 'A 2-week plan in the way you learn best, with a support session booked. Add it to your calendar.',
      learnerId,
      grade: run.grade,
      link: '/portal/learner',
    })),
    ...[...teachers, ...principals].map((userId) => ({
      id: randomUUID(),
      userId,
      kind: 'run-summary' as const,
      title,
      body,
      grade: run.grade,
      link: `/portal/runs/${run.id}`,
    })),
  ]);
}

/** The daily background check across every grade (Vercel Cron, or the principal's button). */
export async function runWatch(): Promise<{ checked: number; alerts: number; notified: number }> {
  const { riskThreshold } = await school();
  const perGrade = await Promise.all(
    GRADES.map(async (grade) => {
      const data = await classFor(grade);
      const alerts = alertsForWatch(data, riskThreshold);
      return {
        checked: data.learners.length,
        alerts: alerts.length,
        notified: await notifyAlerts(grade, alerts),
      };
    }),
  );
  return perGrade.reduce(
    (total, one) => ({
      checked: total.checked + one.checked,
      alerts: total.alerts + one.alerts,
      notified: total.notified + one.notified,
    }),
    { checked: 0, alerts: 0, notified: 0 },
  );
}
