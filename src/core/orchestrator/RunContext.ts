import type { EventDraft } from '../domain/agentEvent';
import type { Goal } from '../domain/goal';
import type { Plan } from '../domain/plan';
import type { Escalation } from '../domain/runSummary';
import type { WorkItem } from '../domain/workItem';
import type { EventBus } from '../events/EventBus';
import type { Budget } from './Budget';
import type { Clock } from './Clock';

export interface RunLimits {
  /** Drafts allowed per work item before it is escalated. */
  maxAttempts: number;
  /** Most steps a plan may have. */
  maxSteps: number;
  callTimeoutMs: number;
  /** Work items processed at the same time. */
  concurrency: number;
}

export interface RunContextInit {
  runId: string;
  goal: Goal;
  limits: RunLimits;
  budget: Budget;
  bus: EventBus;
  clock: Clock;
}

/** Everything one run knows: its goal, plan, produced work, limits and event stream. */
export class RunContext {
  readonly runId: string;
  readonly goal: Goal;
  readonly limits: RunLimits;
  readonly budget: Budget;
  readonly escalations: Escalation[] = [];
  plan: Plan | undefined;

  private readonly bus: EventBus;
  private readonly clock: Clock;
  private readonly startedAt: number;
  private readonly outputs = new Map<string, readonly WorkItem[]>();
  private readonly delivered = new Set<string>();
  private seq = 0;
  private fixCount = 0;

  constructor(init: RunContextInit) {
    this.runId = init.runId;
    this.goal = init.goal;
    this.limits = init.limits;
    this.budget = init.budget;
    this.bus = init.bus;
    this.clock = init.clock;
    this.startedAt = init.clock.now();
  }

  get elapsedMs(): number {
    return this.clock.now() - this.startedAt;
  }

  get fixes(): number {
    return this.fixCount;
  }

  get deliveredCount(): number {
    return this.delivered.size;
  }

  get completedStepIds(): string[] {
    return [...this.outputs.keys()];
  }

  /** Publishes one line of the live log. */
  emit(draft: EventDraft): void {
    this.bus.publish({ ...draft, runId: this.runId, seq: this.seq, ts: this.elapsedMs });
    this.seq += 1;
  }

  completeStep(stepId: string, items: readonly WorkItem[]): void {
    this.outputs.set(stepId, items);
  }

  isDone(stepId: string): boolean {
    return this.outputs.has(stepId);
  }

  outputsOf(stepId: string): readonly WorkItem[] {
    return this.outputs.get(stepId) ?? [];
  }

  /** The work a step consumed for one subject, e.g. the diagnosis behind a learner's plan. */
  upstreamFor(stepId: string, subjectId: string): WorkItem | undefined {
    const step = this.plan?.steps.find((candidate) => candidate.id === stepId);
    return (step?.dependsOn ?? [])
      .flatMap((dependencyId) => this.outputsOf(dependencyId))
      .find((item) => item.subjectId === subjectId);
  }

  /** Hands an item to a person. It is listed in the summary, never silently dropped. */
  escalate(item: Pick<WorkItem, 'id' | 'subjectId' | 'stepId'>, reason: string): void {
    this.escalations.push({
      itemId: item.id,
      subjectId: item.subjectId,
      stepId: item.stepId,
      reason,
    });
    this.emit({
      agent: 'SYS',
      level: 'ESCALATE',
      itemId: item.subjectId,
      message: `${item.subjectId}: needs a human — ${reason}`,
    });
  }

  recordFix(): void {
    this.fixCount += 1;
  }

  recordDelivery(subjectId: string): void {
    this.delivered.add(subjectId);
  }
}
