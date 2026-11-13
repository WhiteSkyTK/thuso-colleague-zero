import { beforeAll, describe, expect, it } from 'vitest';
import { alertsForMarkChange, alertsForWatch, describeAlert } from '@/core/alerts/alertRules';
import { PgliteDatabase } from '@/core/db/PgliteDatabase';
import { migrate } from '@/core/db/schema';
import type { AgentEvent } from '@/core/domain/agentEvent';
import type { ClassData } from '@/core/domain/classData';
import { NotificationRepository } from '@/core/school/NotificationRepository';
import { RunRepository } from '@/core/school/RunRepository';
import { seedSchool } from '@/core/seed/seedSchool';
import { seedClassData } from './helpers/testKit';

const THRESHOLD = 40;
const data = seedClassData();

/** L-001 (on track) suddenly scores very low on several topics. */
function withLowMarks(base: ClassData, learnerId: string, scorePct: number): ClassData {
  return {
    ...base,
    results: base.results.map((r) =>
      r.learnerId === learnerId && r.subjectId === 'MATH' ? { ...r, scorePct } : r,
    ),
  };
}

describe('alert rules', () => {
  it('flags a learner who becomes at risk after new marks, and any mark below 40%', () => {
    const after = withLowMarks(data, 'L-001', 12);
    const alerts = alertsForMarkChange({
      before: data,
      after,
      subjectId: 'MATH',
      topic: 'trigonometry',
      marks: [
        { learnerId: 'L-001', scorePct: 12 },
        { learnerId: 'L-002', scorePct: 75 },
      ],
      threshold: THRESHOLD,
    });
    expect(alerts.map((a) => `${a.learnerId}:${a.kind}`)).toEqual([
      'L-001:at-risk',
      'L-001:low-mark',
    ]);
    const text = describeAlert(alerts[1]!);
    expect(text.forLearner?.title).toContain('12%');
    expect(text.forTeacher.body).toContain('Mathematics');
  });

  it('does not alert again for a learner who was already at risk', () => {
    const alerts = alertsForMarkChange({
      before: data,
      after: data,
      subjectId: 'MATH',
      topic: 'trigonometry',
      marks: [{ learnerId: 'L-014', scorePct: 55 }],
      threshold: THRESHOLD,
    });
    expect(alerts).toEqual([]);
  });

  it('the daily watch lists everyone at risk with the root cause', () => {
    const alerts = alertsForWatch(data, THRESHOLD);
    expect(alerts.filter((a) => a.subjectId === 'MATH')).toHaveLength(7);
    expect(alerts.find((a) => a.learnerId === 'L-014')?.cause).toBe('attendance');
  });
});

describe('run history and notifications on Postgres', () => {
  let db: PgliteDatabase;

  beforeAll(async () => {
    db = await PgliteDatabase.create();
    await migrate(db);
    await seedSchool(db, { grade10: data, demoPasswordHash: 'scrypt$x$y' });
  }, 60_000);

  it('saves a run with its counters and replays its validated events', async () => {
    const runs = new RunRepository(db);
    const id = '6f1c2a5e-1111-4a5b-9c3d-0123456789ab';
    await runs.start({ id, grade: 10, goal: 'Find learners at risk', provider: 'mock' });
    const events: AgentEvent[] = [
      { runId: id, seq: 0, ts: 0, agent: 'PL', level: 'PLAN', message: 'Plan ready.' },
      { runId: id, seq: 1, ts: 700, agent: 'RV', level: 'FLAG', message: 'L-014: wrong cause.' },
      { runId: id, seq: 2, ts: 1400, agent: 'SYS', level: 'DONE', message: 'Workflow complete.' },
    ];
    await runs.finish(
      id,
      {
        goal: 'Find learners at risk',
        status: 'completed',
        stepsCompleted: 5,
        stepsTotal: 5,
        itemsDelivered: 7,
        fixes: 1,
        escalations: [],
        teacherNotes: [],
        humanInterventions: 0,
        durationMs: 1400,
        tokens: 0,
        estCost: 0,
      },
      events,
    );
    const [listed] = await runs.list(5);
    expect(listed).toMatchObject({
      id,
      status: 'completed',
      delivered: 7,
      flags: 1,
      fixes: 1,
      humanInterventions: 0,
    });
    expect((await runs.find(id))?.events).toEqual(events);
    expect(await runs.find('00000000-0000-4000-8000-000000000000')).toBeUndefined();
  }, 60_000);

  it('keeps the same alert about the same learner to once a week, then marks alerts read', async () => {
    const notifications = new NotificationRepository(db);
    const alert = {
      userId: 'S-101',
      kind: 'at-risk' as const,
      title: 'Sipho is now at risk',
      body: 'b',
      learnerId: 'L-003',
    };
    expect(await notifications.add([{ ...alert, id: 'n-1' }])).toBe(1);
    expect(await notifications.add([{ ...alert, id: 'n-2' }])).toBe(0);
    expect(await notifications.unreadFor('S-101', 10)).toHaveLength(1);
    await notifications.markAllRead('S-101');
    expect(await notifications.unreadFor('S-101', 10)).toHaveLength(0);
  }, 60_000);
});
