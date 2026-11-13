import { randomUUID } from 'node:crypto';
import { AnalystAgent } from './agents/AnalystAgent';
import { CoachAgent } from './agents/CoachAgent';
import { MessengerAgent } from './agents/MessengerAgent';
import { PlannerAgent } from './agents/PlannerAgent';
import { ReviewerAgent } from './agents/ReviewerAgent';
import { causeAddressedCheck } from './checks/causeAddressedCheck';
import type { ReviewCheck } from './checks/ReviewCheck';
import type { AppConfig } from './config/env';
import { InMemoryOutbox } from './delivery/InMemoryOutbox';
import { GoalSchema } from './domain/goal';
import type { RunSummary } from './domain/runSummary';
import { EventBus } from './events/EventBus';
import { createLlmProvider } from './llm/createLlmProvider';
import type { LlmProvider } from './llm/LlmProvider';
import { AgentRegistry } from './orchestrator/AgentRegistry';
import { Budget } from './orchestrator/Budget';
import { systemClock, type Clock } from './orchestrator/Clock';
import { CorrectionLoop } from './orchestrator/CorrectionLoop';
import { Orchestrator } from './orchestrator/Orchestrator';
import { RunContext } from './orchestrator/RunContext';

/** Deterministic checks the Reviewer runs, in order. Add a check = add it here. */
const REVIEW_CHECKS: readonly ReviewCheck[] = [causeAddressedCheck];

export interface ColleagueOptions {
  config: AppConfig;
  /** Override the model backend (tests). */
  llm?: LlmProvider;
  clock?: Clock;
}

export interface Colleague {
  /** Live log of every run; subscribe before calling `run`. */
  readonly events: EventBus;
  readonly outbox: InMemoryOutbox;
  /** Takes a goal in plain words and works until it is delivered or bounded out. */
  run(goalText: string, runId?: string): Promise<RunSummary>;
}

/** Composition root — the only place that calls `new` on dependencies. */
export function createColleague(options: ColleagueOptions): Colleague {
  const { config } = options;
  const llm = options.llm ?? createLlmProvider(config);
  const clock = options.clock ?? systemClock;
  const events = new EventBus();
  const outbox = new InMemoryOutbox();

  const registry = new AgentRegistry()
    .register(new AnalystAgent(llm))
    .register(new CoachAgent(llm))
    .register(new ReviewerAgent(llm, REVIEW_CHECKS))
    .register(new MessengerAgent(llm, outbox));
  const orchestrator = new Orchestrator({
    planner: new PlannerAgent(llm),
    registry,
    correction: new CorrectionLoop(registry),
  });

  const run = (goalText: string, runId: string = randomUUID()): Promise<RunSummary> => {
    const goal = GoalSchema.parse({
      id: runId,
      text: goalText,
      constraints: config.rules,
      createdAt: new Date(clock.now()).toISOString(),
    });
    const budget = new Budget(
      {
        tokenBudget: config.run.tokenBudget,
        maxSteps: config.run.maxSteps,
        runTimeoutMs: config.run.timeoutMs,
        costPerMTok: config.llm.costPerMTok,
      },
      clock,
    );
    const limits = {
      maxAttempts: config.run.maxAttempts,
      maxSteps: config.run.maxSteps,
      callTimeoutMs: config.llm.callTimeoutMs,
      concurrency: config.llm.concurrency,
    };
    return orchestrator.run(new RunContext({ runId, goal, limits, budget, bus: events, clock }));
  };

  return { events, outbox, run };
}
