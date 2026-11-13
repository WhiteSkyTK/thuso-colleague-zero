import { describe, expect, it } from 'vitest';
import { classReport, PASS_MARK_PCT } from '@/core/analysis/classReport';
import { createColleague } from '@/core/createColleague';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { InMemoryClassRepository } from '@/core/repositories/InMemoryClassRepository';
import { mockConfig, seedClassData } from './helpers/testKit';

const data = seedClassData();
const records = new InMemoryClassRepository(data).recordsFor('MATH');

describe('classReport', () => {
  it('lists failing learners below the pass mark, neediest first', () => {
    const failing = classReport(records, 'failing', 40);
    expect(failing.every((row) => row.averagePct < PASS_MARK_PCT)).toBe(true);
    expect(failing.map((row) => row.averagePct)).toEqual(
      [...failing.map((row) => row.averagePct)].sort((a, b) => a - b),
    );
  });

  it('lists passing learners best first and splits the class with failing', () => {
    const passing = classReport(records, 'passing', 40);
    const failing = classReport(records, 'failing', 40);
    expect(passing.length + failing.length).toBe(records.length);
    expect(passing[0]!.averagePct).toBeGreaterThanOrEqual(passing.at(-1)!.averagePct);
  });

  it('matches the at-risk learners the Analyst plans for', () => {
    expect(
      classReport(records, 'at-risk', 40)
        .map((row) => row.learnerId)
        .sort(),
    ).toEqual(['L-003', 'L-009', 'L-014', 'L-018', 'L-021', 'L-027', 'L-030']);
  });
});

describe('a question gets a different plan', () => {
  it('"show failing learners" plans a report: no catch-up plans, nothing sent to learners', async () => {
    const colleague = createColleague({ config: mockConfig(), classData: data });
    const events: AgentEvent[] = [];
    colleague.events.subscribe((event) => events.push(event));
    const summary = await colleague.run(
      'Show me the learners failing Mathematics this term.',
      'run-report',
    );
    const plan = events.find((event) => event.level === 'PLAN');
    expect(plan?.message).toContain('list-learners → send-summary');
    expect(summary).toMatchObject({
      status: 'completed',
      stepsTotal: 2,
      itemsDelivered: 0,
      humanInterventions: 0,
    });
    expect(colleague.outbox.sent.map((message) => message.audience)).toEqual(['teacher']);
    expect(summary.teacherNotes.some((note) => note.includes('failing'))).toBe(true);
  });

  it('the usual goal still writes catch-up plans', async () => {
    const colleague = createColleague({ config: mockConfig(), classData: data });
    const summary = await colleague.run(
      'Find every Grade 10 learner at risk of failing Mathematics this term and send each a plan.',
      'run-plans',
    );
    expect(summary.stepsTotal).toBe(5);
    expect(summary.itemsDelivered).toBe(7);
  });
});
