import { describe, expect, it } from 'vitest';
import { DEMO_GOAL_TEXT } from '@/core/config/constants';
import { createColleague } from '@/core/createColleague';
import type { AgentEvent } from '@/core/domain/agentEvent';
import { formatEvent } from '@/core/events/formatEvent';
import { mockConfig } from './helpers/testKit';

/** Golden demo: the full run on the offline provider — what `npm run demo` shows. */
describe('demo scenario', () => {
  it('plans, catches a mistake, fixes it and delivers with no human intervention', async () => {
    const colleague = createColleague({ config: mockConfig() });
    const events: AgentEvent[] = [];
    colleague.events.subscribe((event) => events.push(event));

    const summary = await colleague.run(DEMO_GOAL_TEXT, 'run-golden');

    const count = (agent: string, level: string): number =>
      events.filter((event) => event.agent === agent && event.level === level).length;
    expect(count('PL', 'PLAN')).toBe(1);
    expect(count('RV', 'FLAG')).toBeGreaterThanOrEqual(1);
    expect(count('CO', 'FIX')).toBeGreaterThanOrEqual(1);
    expect(count('MS', 'DONE')).toBe(1);
    expect(events.at(-1)).toMatchObject({ agent: 'SYS', level: 'DONE' });

    expect(summary).toMatchObject({
      status: 'completed',
      stepsCompleted: 5,
      stepsTotal: 5,
      itemsDelivered: 3,
      fixes: 1,
      humanInterventions: 0,
    });
    expect(summary.escalations).toEqual([]);
    expect(summary.tokens).toBeGreaterThan(0);
  });

  it('flags L-014 on the evidence and logs the reason for the fix', async () => {
    const colleague = createColleague({ config: mockConfig() });
    const lines: string[] = [];
    colleague.events.subscribe((event) => lines.push(formatEvent(event)));

    await colleague.run(DEMO_GOAL_TEXT);

    expect(lines).toContain(
      '00:00:00 [RV·FLAG] L-014: plan targets topic-gap, but 9 absences in 6 weeks.',
    );
    expect(lines.some((line) => line.includes('[CO·FIX] L-014: plan now leads with attendance'))).toBe(
      true,
    );
  });

  it('delivers to the learner and guardian of every at-risk learner, then the teacher', async () => {
    const colleague = createColleague({ config: mockConfig() });

    await colleague.run(DEMO_GOAL_TEXT);

    const audiences = colleague.outbox.sent.map((message) => `${message.audience}:${message.subjectId}`);
    expect(audiences).toEqual(
      expect.arrayContaining([
        'learner:L-009',
        'guardian:L-009',
        'learner:L-014',
        'guardian:L-014',
        'learner:L-021',
        'guardian:L-021',
        'teacher:class',
      ]),
    );
    expect(audiences).toHaveLength(7);
  });

  it('events carry ordered sequence numbers and the run id', async () => {
    const colleague = createColleague({ config: mockConfig() });
    const events: AgentEvent[] = [];
    colleague.events.subscribe((event) => events.push(event));

    await colleague.run(DEMO_GOAL_TEXT, 'run-seq');

    expect(events.map((event) => event.seq)).toEqual(events.map((_event, index) => index));
    expect(new Set(events.map((event) => event.runId))).toEqual(new Set(['run-seq']));
  });
});
