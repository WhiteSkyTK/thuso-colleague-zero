import { describe, expect, it } from 'vitest';
import type { Agent } from '@/core/agents/Agent';
import type { PlanRequest } from '@/core/agents/PlannerAgent';
import type { Plan } from '@/core/domain/plan';
import type { StepResult } from '@/core/domain/step';
import { BudgetExceededError, StepFailedError } from '@/core/errors/AppError';
import { AgentRegistry } from '@/core/orchestrator/AgentRegistry';
import { CorrectionLoop } from '@/core/orchestrator/CorrectionLoop';
import { Orchestrator } from '@/core/orchestrator/Orchestrator';
import {
  createTestRun,
  FakeAgent,
  failWith,
  levelsOf,
  PASS,
  planOf,
  step,
  type FakeHandler,
  type TestRunOptions,
} from '../helpers/testKit';

const LEARNERS = ['L-001', 'L-002'];
const outputs = (ids: string[], payload: unknown = 'draft'): StepResult => ({
  kind: 'outputs',
  outputs: ids.map((subjectId) => ({ subjectId, payload })),
});

const STANDARD_PLAN = planOf(
  step('s1', 'AN', 'find'),
  step('s2', 'CO', 'draft', ['s1']),
  step('s3', 'RV', 'review', ['s2']),
  step('s4', 'MS', 'deliver', ['s3']),
);

/** A planner that returns the given plans in order, repeating the last one. */
function scriptedPlanner(plans: Plan[]): { planner: Agent<PlanRequest, Plan>; requests: PlanRequest[] } {
  const requests: PlanRequest[] = [];
  const planner = {
    execute: (request: PlanRequest) => {
      requests.push(request);
      return Promise.resolve(plans[Math.min(requests.length, plans.length) - 1] as Plan);
    },
  } as unknown as Agent<PlanRequest, Plan>;
  return { planner, requests };
}

interface Team {
  find?: FakeHandler;
  draft?: FakeHandler;
  review?: FakeHandler;
  plans?: Plan[];
  run?: TestRunOptions;
}

function setUp(team: Team = {}) {
  const analyst = new FakeAgent('AN', {
    find: { scope: 'once', handle: team.find ?? (() => outputs(LEARNERS, 'diagnosis')) },
  });
  const coach = new FakeAgent('CO', {
    draft: {
      scope: 'each',
      handle: team.draft ?? ((request) => outputs([request.items[0]?.subjectId ?? '?'])),
    },
  });
  const reviewer = new FakeAgent('RV', {
    review: { scope: 'each', handle: team.review ?? (() => ({ kind: 'verdict', verdict: PASS })) },
  });
  const messenger = new FakeAgent('MS', {
    deliver: {
      scope: 'each',
      handle: (request) => {
        const subjectId = request.items[0]?.subjectId ?? '?';
        testRun.ctx.recordDelivery(subjectId);
        return outputs([subjectId], 'sent');
      },
    },
  });
  const registry = new AgentRegistry()
    .register(analyst)
    .register(coach)
    .register(reviewer)
    .register(messenger);
  const { planner, requests } = scriptedPlanner(team.plans ?? [STANDARD_PLAN]);
  const orchestrator = new Orchestrator({
    planner,
    registry,
    correction: new CorrectionLoop(registry),
  });
  const testRun = createTestRun(team.run);
  return { orchestrator, coach, reviewer, messenger, plannerRequests: requests, ...testRun };
}

describe('Orchestrator', () => {
  it('delivers every item when all work passes review first time', async () => {
    const { orchestrator, ctx, events, messenger } = setUp();

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({
      status: 'completed',
      stepsCompleted: 4,
      stepsTotal: 4,
      itemsDelivered: 2,
      fixes: 0,
      humanInterventions: 0,
    });
    expect(messenger.requests).toHaveLength(2);
    expect(levelsOf(events).at(-1)).toBe('SYS·DONE');
  });

  it('sends a failed item back to its producer and re-reviews the fix', async () => {
    let reviews = 0;
    const { orchestrator, ctx, coach, messenger } = setUp({
      find: () => outputs(['L-014'], 'diagnosis'),
      review: () => {
        reviews += 1;
        return { kind: 'verdict', verdict: reviews === 1 ? failWith('9 absences') : PASS };
      },
    });

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({ fixes: 1, itemsDelivered: 1, humanInterventions: 0 });
    const fixRequest = coach.requests[1];
    expect(fixRequest?.fix?.verdict.fixInstructions).toBe('fix it');
    expect(fixRequest?.items[0]?.payload).toBe('diagnosis');
    const delivered = messenger.requests[0]?.items[0];
    expect(delivered).toMatchObject({ attempt: 2, subjectId: 'L-014' });
    expect(delivered?.history[0]).toMatchObject({ attempt: 1, payload: 'draft' });
  });

  it('escalates an item that still fails after the maximum attempts', async () => {
    const { orchestrator, ctx, events, coach, messenger } = setUp({
      find: () => outputs(['L-021'], 'diagnosis'),
      review: () => ({ kind: 'verdict', verdict: failWith('unknown resource R-999') }),
    });

    const summary = await orchestrator.run(ctx);

    expect(coach.requests).toHaveLength(3);
    expect(messenger.requests).toHaveLength(0);
    expect(summary).toMatchObject({ status: 'completed', itemsDelivered: 0, humanInterventions: 1 });
    expect(summary.escalations[0]).toMatchObject({ subjectId: 'L-021' });
    expect(summary.escalations[0]?.reason).toContain('unknown resource R-999');
    expect(levelsOf(events)).toContain('SYS·ESCALATE');
  });

  it('escalates one broken item and still delivers the others', async () => {
    const { orchestrator, ctx } = setUp({
      draft: (request) => {
        const subjectId = request.items[0]?.subjectId ?? '?';
        if (subjectId === 'L-001') {
          throw new StepFailedError('model output failed validation twice');
        }
        return outputs([subjectId]);
      },
    });

    const summary = await orchestrator.run(ctx);

    expect(summary.itemsDelivered).toBe(1);
    expect(summary.escalations.map((escalation) => escalation.subjectId)).toEqual(['L-001']);
  });

  it('asks the Planner for a new plan when a whole step fails', async () => {
    let finds = 0;
    const { orchestrator, ctx, events, plannerRequests } = setUp({
      find: () => {
        finds += 1;
        if (finds === 1) {
          throw new StepFailedError('attendance records are missing');
        }
        return outputs(LEARNERS, 'diagnosis');
      },
    });

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({ status: 'completed', itemsDelivered: 2 });
    expect(plannerRequests).toHaveLength(2);
    expect(plannerRequests[1]?.issue).toContain('attendance records are missing');
    expect(levelsOf(events)).toContain('SYS·WARN');
  });

  it('stops with a summary when re-planning keeps failing', async () => {
    const { orchestrator, ctx, events, plannerRequests } = setUp({
      find: () => {
        throw new StepFailedError('no class data');
      },
    });

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({ status: 'stopped', stopReason: 'no class data' });
    expect(plannerRequests).toHaveLength(3);
    expect(levelsOf(events).at(-1)).toBe('SYS·ERROR');
  });

  it('rejects a plan with unknown actions or forward dependencies, then stops', async () => {
    const badPlan = planOf(step('s1', 'CO', 'draft', ['s2']), step('s2', 'AN', 'dance'));
    const { orchestrator, ctx, plannerRequests } = setUp({ plans: [badPlan] });

    const summary = await orchestrator.run(ctx);

    expect(summary.status).toBe('stopped');
    expect(summary.stopReason).toContain('AN has no action "dance"');
    expect(summary.stopReason).toContain('not an earlier step');
    expect(plannerRequests).toHaveLength(2);
    expect(plannerRequests[1]?.issue).toContain('Plan rejected');
  });

  it('stops cleanly when the budget is exceeded', async () => {
    const { orchestrator, ctx, messenger } = setUp({
      draft: () => {
        throw new BudgetExceededError('token budget of 10 used up');
      },
    });

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({ status: 'stopped', itemsDelivered: 0 });
    expect(summary.stopReason).toContain('token budget');
    expect(messenger.requests).toHaveLength(0);
  });

  it('stops when the plan needs more steps than the step limit', async () => {
    const { orchestrator, ctx } = setUp({ run: { budget: { maxSteps: 2 } } });

    const summary = await orchestrator.run(ctx);

    expect(summary).toMatchObject({ status: 'stopped', stepsCompleted: 2 });
    expect(summary.stopReason).toContain('step limit');
  });
});
