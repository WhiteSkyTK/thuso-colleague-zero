import type { ActionSpec, StepAgent } from '@/core/agents/StepAgent';
import { loadConfig, type AppConfig } from '@/core/config/env';
import type { AgentEvent } from '@/core/domain/agentEvent';
import type { AgentCode } from '@/core/domain/codes';
import type { Plan, PlanStep } from '@/core/domain/plan';
import type { ReviewVerdict } from '@/core/domain/review';
import type { StepRequest, StepResult } from '@/core/domain/step';
import { EventBus } from '@/core/events/EventBus';
import { Budget, type BudgetLimits } from '@/core/orchestrator/Budget';
import type { Clock } from '@/core/orchestrator/Clock';
import { RunContext, type RunLimits } from '@/core/orchestrator/RunContext';

/** A clock tests can move by hand. */
export class ManualClock implements Clock {
  private current = 0;

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    this.current += ms;
  }
}

export const mockConfig = (overrides: Record<string, string> = {}): AppConfig =>
  loadConfig({ LLM_PROVIDER: 'mock', ...overrides });

export interface TestRun {
  ctx: RunContext;
  events: AgentEvent[];
  clock: ManualClock;
}

export interface TestRunOptions {
  limits?: Partial<RunLimits>;
  budget?: Partial<BudgetLimits>;
}

/** A run context with generous limits and every event captured. */
export function createTestRun(options: TestRunOptions = {}): TestRun {
  const clock = new ManualClock();
  const bus = new EventBus();
  const events: AgentEvent[] = [];
  bus.subscribe((event) => events.push(event));
  const budget = new Budget(
    {
      tokenBudget: 100_000,
      maxSteps: 25,
      runTimeoutMs: 60_000,
      costPerMTok: { input: 0, output: 0 },
      ...options.budget,
    },
    clock,
  );
  const ctx = new RunContext({
    runId: 'run-test',
    goal: {
      id: 'goal-test',
      text: 'Help the learners at risk.',
      constraints: { riskThreshold: 40, maxHoursPerWeek: 4 },
      createdAt: '2026-11-13T09:00:00.000Z',
    },
    limits: { maxAttempts: 3, maxSteps: 25, callTimeoutMs: 1_000, concurrency: 2, ...options.limits },
    budget,
    bus,
    clock,
  });
  return { ctx, events, clock };
}

export const step = (
  id: string,
  agent: AgentCode,
  action: string,
  dependsOn: string[] = [],
): PlanStep => ({ id, agent, action, input: {}, successCriteria: [], dependsOn });

export const planOf = (...steps: PlanStep[]): Plan => ({
  goalId: 'goal-test',
  rationale: 'test plan',
  steps,
});

export const PASS: ReviewVerdict = { status: 'pass', issues: [] };

export const failWith = (evidence: string): ReviewVerdict => ({
  status: 'fail',
  issues: [{ checkId: 'test-check', passed: false, severity: 'error', evidence, fixHint: 'fix it' }],
  fixInstructions: 'fix it',
});

export type FakeHandler = (request: StepRequest) => StepResult | Promise<StepResult>;

/** A scripted stand-in for a real agent. Records every request it receives. */
export class FakeAgent implements StepAgent {
  readonly requests: StepRequest[] = [];
  readonly actions: Record<string, ActionSpec>;

  constructor(
    readonly code: AgentCode,
    private readonly handlers: Record<string, { scope: ActionSpec['scope']; handle: FakeHandler }>,
  ) {
    this.actions = Object.fromEntries(
      Object.entries(handlers).map(([name, def]) => [name, { description: name, scope: def.scope }]),
    );
  }

  async execute(request: StepRequest): Promise<StepResult> {
    this.requests.push(request);
    const handler = this.handlers[request.step.action];
    if (!handler) {
      throw new Error(`FakeAgent ${this.code} has no action ${request.step.action}`);
    }
    return handler.handle(request);
  }
}

export const levelsOf = (events: AgentEvent[]): string[] =>
  events.map((event) => `${event.agent}·${event.level}`);
