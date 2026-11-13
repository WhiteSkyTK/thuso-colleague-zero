import { randomUUID } from 'node:crypto';
import { AnalystAgent } from './agents/AnalystAgent';
import { CoachAgent } from './agents/CoachAgent';
import { MessengerAgent } from './agents/MessengerAgent';
import { PlannerAgent } from './agents/PlannerAgent';
import { ReviewerAgent } from './agents/ReviewerAgent';
import { REVIEW_CHECKS } from './checks/reviewChecks';
import type { AppConfig } from './config/env';
import { InMemoryOutbox } from './delivery/InMemoryOutbox';
import type { ClassData } from './domain/classData';
import { GoalSchema } from './domain/goal';
import type { RunSummary } from './domain/runSummary';
import { EventBus } from './events/EventBus';
import { TraceRecorder } from './events/TraceRecorder';
import { createLlmProvider } from './llm/createLlmProvider';
import type { LlmProvider } from './llm/LlmProvider';
import { AgentRegistry } from './orchestrator/AgentRegistry';
import { Budget } from './orchestrator/Budget';
import { systemClock, type Clock } from './orchestrator/Clock';
import { CorrectionLoop } from './orchestrator/CorrectionLoop';
import { Orchestrator } from './orchestrator/Orchestrator';
import { RunContext } from './orchestrator/RunContext';
import { InMemoryClassRepository } from './repositories/InMemoryClassRepository';

export interface ColleagueOptions {
  config: AppConfig;
  /** The class the colleague works for. */
  classData: ClassData;
  /** Override the model backend (tests). */
  llm?: LlmProvider;
  clock?: Clock;
}

export interface Colleague {
  /** Live log of every run; subscribe before calling `run`. */
  readonly events: EventBus;
  readonly outbox: InMemoryOutbox;
  /** Recorded events per run, for late viewers and replay. */
  readonly trace: TraceRecorder;
  /** Takes a goal in plain words and works until it is delivered or bounded out. */
  run(goalText: string, runId?: string): Promise<RunSummary>;
}

/** Composition root — the only place that calls `new` on dependencies. */
export function createColleague(options: ColleagueOptions): Colleague {
  const { config } = options;
  const llm = options.llm ?? createLlmProvider(config);
  const clock = options.clock ?? systemClock;
  const events = new EventBus();
  const trace = new TraceRecorder(events);
  const outbox = new InMemoryOutbox();
  const classRepo = new InMemoryClassRepository(options.classData);

  // Each agent gets only the slice of the class it needs.
  const registry = new AgentRegistry()
    .register(new AnalystAgent(llm, classRepo))
    .register(new CoachAgent(llm, { catalog: classRepo, calendar: classRepo }))
    .register(
      new ReviewerAgent(llm, { checks: REVIEW_CHECKS, catalog: classRepo, calendar: classRepo }),
    )
    .register(new MessengerAgent(llm, { outbox, directory: classRepo }));
  const orchestrator = new Orchestrator({
    planner: new PlannerAgent(llm, classRepo),
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

  return { events, outbox, trace, run };
}
