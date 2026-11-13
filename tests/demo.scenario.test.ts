import { beforeAll, describe, expect, it } from 'vitest';
import { DEMO_GOAL_TEXT } from '@/core/config/constants';
import { createColleague, type Colleague } from '@/core/createColleague';
import type { AgentEvent } from '@/core/domain/agentEvent';
import type { RunSummary } from '@/core/domain/runSummary';
import { formatEvent } from '@/core/events/formatEvent';
import { mockConfig, seedClassData } from './helpers/testKit';

const AT_RISK_IN_MATHS = ['L-003', 'L-009', 'L-014', 'L-018', 'L-021', 'L-027', 'L-030'];

interface Run {
  colleague: Colleague;
  events: AgentEvent[];
  lines: string[];
  summary: RunSummary;
}

async function runGoal(goal: string): Promise<Run> {
  const colleague = createColleague({ config: mockConfig(), classData: seedClassData() });
  const events: AgentEvent[] = [];
  colleague.events.subscribe((event) => events.push(event));
  const summary = await colleague.run(goal, 'run-golden');
  return { colleague, events, lines: events.map(formatEvent), summary };
}

const count = (events: AgentEvent[], agent: string, level: string): number =>
  events.filter((event) => event.agent === agent && event.level === level).length;

/** Golden demo: the full run on the seed class with the offline provider — what `npm run demo` shows. */
describe('demo scenario — Mathematics', () => {
  let run: Run;
  beforeAll(async () => {
    run = await runGoal(DEMO_GOAL_TEXT);
  });

  it('finishes with every at-risk learner delivered and no human intervention', () => {
    expect(run.summary).toMatchObject({
      status: 'completed',
      stepsCompleted: 5,
      stepsTotal: 5,
      itemsDelivered: AT_RISK_IN_MATHS.length,
      fixes: 2,
      humanInterventions: 0,
    });
    expect(run.summary.escalations).toEqual([]);
    expect(run.events.at(-1)).toMatchObject({ agent: 'SYS', level: 'DONE' });
    expect(count(run.events, 'MS', 'DONE')).toBe(1);
  });

  it('re-plans when attendance records are missing instead of stopping', () => {
    expect(count(run.events, 'PL', 'PLAN')).toBe(2);
    expect(run.lines.some((line) => line.includes('[SYS·WARN] Step failed, re-planning'))).toBe(
      true,
    );
    expect(run.lines.some((line) => line.includes('no attendance register for L-030'))).toBe(true);
  });

  it('catches the attendance cause for L-014 and logs the reason for the fix', () => {
    expect(
      run.lines.some((line) =>
        line.includes(
          '[RV·FLAG] L-014: plan targets topic-gap, but 9 absences in the last 6 weeks.',
        ),
      ),
    ).toBe(true);
    expect(run.lines.some((line) => line.includes('[CO·FIX] L-014: plan rewritten'))).toBe(true);
    expect(
      run.lines.some((line) => line.includes('[RV·PASS] L-014: plan approved (attempt 2).')),
    ).toBe(true);
  });

  it('rejects the invented resource for L-021 and tells the teacher about the catalogue gap', () => {
    expect(
      run.lines.some((line) =>
        line.includes('[RV·FLAG] L-021: R-099 is not in the resource catalogue.'),
      ),
    ).toBe(true);
    expect(run.summary.teacherNotes.some((note) => note.includes('nothing for statistics'))).toBe(
      true,
    );
  });

  it('flags the instruction in the L-027 reflection without obeying it', () => {
    expect(
      run.lines.some((line) => line.includes('[RV·FLAG] L-027: the reflection contains')),
    ).toBe(true);
    expect(run.lines.some((line) => line.includes('L-027: plan sent'))).toBe(true);
  });

  it('explains why the learner exactly on the threshold is included', () => {
    expect(
      run.lines.some(
        (line) => line.includes('L-009: risk 40') && line.includes('Exactly on the threshold'),
      ),
    ).toBe(true);
  });

  it('sends two messages per learner and one teacher summary, only to directory addresses', () => {
    const { sent } = run.colleague.outbox;
    expect(sent).toHaveLength(AT_RISK_IN_MATHS.length * 2 + 1);
    expect(sent.every((message) => message.to.endsWith('.example.org'))).toBe(true);
    const learners = sent
      .filter((message) => message.audience === 'learner')
      .map((message) => message.subjectId);
    expect(learners.sort()).toEqual(AT_RISK_IN_MATHS);
    const summary = sent.find((message) => message.audience === 'teacher');
    expect(summary?.body).toContain('7 plans delivered · 2 fixed after review · 0 escalated');
  });

  it('numbers events in order and tags them with the run id', () => {
    expect(run.events.map((event) => event.seq)).toEqual(run.events.map((_event, index) => index));
    expect(new Set(run.events.map((event) => event.runId))).toEqual(new Set(['run-golden']));
  });
});

describe('demo scenario — a different goal gives a different plan', () => {
  it('works on Physical Sciences when the goal names it', async () => {
    const run = await runGoal(
      'Find every Grade 10 learner at risk in Physical Sciences and send each a catch-up plan.',
    );
    const learners = run.colleague.outbox.sent
      .filter((message) => message.audience === 'learner')
      .map((message) => message.subjectId);
    expect(learners.sort()).toEqual(['L-005', 'L-014', 'L-022']);
    expect(run.summary).toMatchObject({ status: 'completed', humanInterventions: 0 });
    expect(run.lines.some((line) => line.includes('scored in PHSC'))).toBe(true);
  });
});
