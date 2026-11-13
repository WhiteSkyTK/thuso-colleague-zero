import { TEMPERATURE } from '../config/constants';
import type { AgentCode } from '../domain/codes';
import type { Goal } from '../domain/goal';
import { PlanDraftSchema, type Plan } from '../domain/plan';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { PLANNER_PROMPT, toPrompt } from '../prompts/prompts';
import { Agent } from './Agent';
import type { ActionSpec } from './StepAgent';

/** One thing some agent can do — the Planner may only plan with these. */
export interface CatalogueEntry extends ActionSpec {
  agent: AgentCode;
  action: string;
}

export interface PlanRequest {
  goal: Goal;
  catalogue: readonly CatalogueEntry[];
  /** Steps already finished; a re-plan must keep their ids. */
  completedStepIds: readonly string[];
  /** Why a new plan is needed (failed step, rejected plan, missing data). */
  issue?: string;
}

/** PL — builds the plan at run time from the goal and what the team can do. */
export class PlannerAgent extends Agent<PlanRequest, Plan> {
  constructor(llm: LlmProvider) {
    super('PL', llm);
  }

  protected async run(request: PlanRequest, ctx: RunContext): Promise<Plan> {
    this.say(ctx, {
      level: 'INFO',
      message: request.issue ? `Re-planning. ${request.issue}` : 'Goal received. Building the plan.',
    });
    const asked = await this.ask(ctx, PlanDraftSchema, {
      task: 'planner.plan',
      tier: 'reasoning',
      system: PLANNER_PROMPT,
      prompt: toPrompt(request),
      input: request,
      temperature: TEMPERATURE.planning,
    });
    const plan: Plan = { goalId: request.goal.id, ...asked.value };
    this.say(ctx, {
      level: 'PLAN',
      message: `${plan.steps.length} steps: ${plan.steps.map((step) => step.action).join(' → ')}.`,
      tokens: asked.tokens,
      ms: asked.ms,
      data: { rationale: plan.rationale, steps: plan.steps },
    });
    return plan;
  }
}
