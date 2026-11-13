import type { Agent } from '../agents/Agent';
import type { PlanRequest } from '../agents/PlannerAgent';
import type { StepAgent } from '../agents/StepAgent';
import { AGENT_META, MAX_REPLANS, PLAN_ATTEMPTS } from '../config/constants';
import type { Plan, PlanStep } from '../domain/plan';
import type { RunSummary } from '../domain/runSummary';
import { createWorkItem, type WorkItem } from '../domain/workItem';
import { AppError, BudgetExceededError, PlanInvalidError, StepFailedError } from '../errors/AppError';
import type { AgentRegistry } from './AgentRegistry';
import { buildSummary } from './buildSummary';
import { mapWithLimit } from './Concurrency';
import type { CorrectionLoop } from './CorrectionLoop';
import type { RunContext } from './RunContext';
import { validatePlan } from './validatePlan';

export interface OrchestratorDeps {
  planner: Agent<PlanRequest, Plan>;
  registry: AgentRegistry;
  correction: CorrectionLoop;
}

/** A failure the Planner may be able to route around. Budget breaches are final. */
const canReplan = (error: unknown): error is AppError =>
  error instanceof AppError &&
  !(error instanceof BudgetExceededError) &&
  !(error instanceof PlanInvalidError);

/**
 * Mediator: owns routing, parallelism, retries, budgets and re-planning.
 * Agents never call each other — all work passes through here.
 */
export class Orchestrator {
  constructor(private readonly deps: OrchestratorDeps) {}

  /** Runs one goal to the end and always returns a summary, even when it stops early. */
  async run(ctx: RunContext): Promise<RunSummary> {
    ctx.emit({ agent: 'SYS', level: 'INFO', message: `Run started. Goal: ${ctx.goal.text}` });
    let stopReason: string | undefined;
    try {
      await this.planAndExecute(ctx);
    } catch (error) {
      stopReason = error instanceof Error ? error.message : 'unknown error';
    }
    const summary = buildSummary(ctx, stopReason);
    ctx.emit({
      agent: 'SYS',
      level: stopReason ? 'ERROR' : 'DONE',
      message: stopReason
        ? `Run stopped: ${stopReason}. Human interventions: ${summary.humanInterventions}.`
        : `Workflow complete. Human interventions: ${summary.humanInterventions}.`,
      data: { summary },
    });
    return summary;
  }

  /** Plan, execute, and when a step fails ask the Planner for a new plan (bounded). */
  private async planAndExecute(ctx: RunContext): Promise<void> {
    let issue: string | undefined;
    for (let replans = 0; replans <= MAX_REPLANS; replans += 1) {
      ctx.plan = await this.makePlan(ctx, issue);
      try {
        await this.executePlan(ctx.plan, ctx);
        return;
      } catch (error) {
        if (!canReplan(error) || replans === MAX_REPLANS) {
          throw error;
        }
        issue = error.message;
        ctx.emit({ agent: 'SYS', level: 'WARN', message: `Step failed, re-planning: ${issue}` });
      }
    }
  }

  /** Asks the Planner for a plan and validates it in code; one repair round, then stop. */
  private async makePlan(ctx: RunContext, initialIssue?: string): Promise<Plan> {
    let issue = initialIssue;
    for (let attempt = 0; attempt < PLAN_ATTEMPTS; attempt += 1) {
      const plan = await this.deps.planner.execute(
        {
          goal: ctx.goal,
          catalogue: this.deps.registry.catalogue(),
          completedStepIds: ctx.completedStepIds,
          issue,
        },
        ctx,
      );
      const problems = validatePlan(plan, this.deps.registry, ctx.limits.maxSteps);
      if (problems.length === 0) {
        return plan;
      }
      issue = `Plan rejected: ${problems.join('; ')}`;
      ctx.emit({ agent: 'SYS', level: 'WARN', message: issue });
    }
    throw new PlanInvalidError(issue ?? 'the Planner produced no usable plan');
  }

  private async executePlan(plan: Plan, ctx: RunContext): Promise<void> {
    for (const [index, step] of plan.steps.entries()) {
      if (ctx.isDone(step.id)) {
        continue;
      }
      ctx.budget.countStep();
      ctx.emit({
        agent: 'SYS',
        level: 'INFO',
        message: `Step ${index + 1} of ${plan.steps.length}: ${AGENT_META[step.agent].name} → ${step.action}`,
        data: { stepId: step.id, stepIndex: index + 1, stepsTotal: plan.steps.length },
      });
      ctx.completeStep(step.id, await this.runStep(step, ctx));
    }
  }

  private async runStep(step: PlanStep, ctx: RunContext): Promise<WorkItem[]> {
    const agent = this.deps.registry.get(step.agent);
    const upstream = step.dependsOn.flatMap((dependencyId) => ctx.outputsOf(dependencyId));
    if (this.deps.registry.specFor(step)?.scope !== 'each') {
      return this.runOnce(step, agent, upstream, ctx);
    }
    const perItem = await mapWithLimit(upstream, ctx.limits.concurrency, (item) =>
      this.runForItem(step, agent, item, ctx),
    );
    return perItem.flat();
  }

  private async runOnce(
    step: PlanStep,
    agent: StepAgent,
    upstream: readonly WorkItem[],
    ctx: RunContext,
  ): Promise<WorkItem[]> {
    const result = await agent.execute({ step, items: upstream }, ctx);
    if (result.kind !== 'outputs') {
      throw new StepFailedError(`step ${step.id}: a review action must run once per item`);
    }
    return result.outputs.map((output) => createWorkItem(step, output));
  }

  /** One item's failure never sinks the run: it is escalated and the others carry on. */
  private async runForItem(
    step: PlanStep,
    agent: StepAgent,
    item: WorkItem,
    ctx: RunContext,
  ): Promise<WorkItem[]> {
    try {
      const result = await agent.execute({ step, items: [item] }, ctx);
      if (result.kind === 'outputs') {
        return result.outputs.map((output) => createWorkItem(step, output));
      }
      const approved = await this.deps.correction.resolve(
        { reviewStep: step, item, verdict: result.verdict },
        ctx,
      );
      return approved ? [approved] : [];
    } catch (error) {
      if (!(error instanceof AppError) || error instanceof BudgetExceededError) {
        throw error;
      }
      ctx.escalate(item, error.message);
      return [];
    }
  }
}
