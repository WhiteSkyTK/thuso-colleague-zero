import { TEMPERATURE } from '../config/constants';
import { CatchUpPlanSchema, type CatchUpPlan } from '../domain/catchUpPlan';
import { DiagnosisSchema } from '../domain/diagnosis';
import type { FixRequest, StepRequest, StepResult } from '../domain/step';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { COACH_PROMPT, toPrompt } from '../prompts/prompts';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import { singleItem } from './singleItem';
import type { StepAgent } from './StepAgent';

/** CO — writes each at-risk learner's 2-week catch-up plan, and rewrites it when reviewed. */
export class CoachAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'draft-plan': {
      description: 'Write a 2-week catch-up plan and messages for one diagnosed learner.',
      scope: 'each',
      handle: (request, ctx) => this.draftPlan(request, ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(llm: LlmProvider) {
    super('CO', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async draftPlan(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const source = singleItem(request);
    const diagnosis = DiagnosisSchema.parse(source.payload);
    const input = {
      diagnosis,
      constraints: ctx.goal.constraints,
      fix: request.fix && {
        previousPlan: request.fix.previous.payload,
        instructions: request.fix.verdict.fixInstructions ?? '',
      },
    };
    const asked = await this.ask(ctx, CatchUpPlanSchema, {
      task: 'coach.draft-plan',
      tier: 'reasoning',
      system: COACH_PROMPT,
      prompt: toPrompt(input),
      input,
      temperature: TEMPERATURE.writing,
    });
    // The plan is for the learner we were given, whatever id the model wrote.
    const plan: CatchUpPlan = { ...asked.value, learnerId: diagnosis.learnerId };
    const changeNote = request.fix ? this.describeFix(plan, request.fix) : undefined;
    this.say(ctx, {
      level: request.fix ? 'FIX' : 'ACT',
      itemId: plan.learnerId,
      message: changeNote ?? `${plan.learnerId}: plan drafted — ${plan.summary}.`,
      tokens: asked.tokens,
      ms: asked.ms,
    });
    return { kind: 'outputs', outputs: [{ subjectId: source.subjectId, payload: plan, changeNote }] };
  }

  /** Every fix is logged with its reason (CLAUDE.md §7.5). */
  private describeFix(plan: CatchUpPlan, fix: FixRequest): string {
    const evidence = fix.verdict.issues[0]?.evidence ?? 'reviewer feedback';
    return `${plan.learnerId}: plan now leads with ${plan.addresses[0]} — reviewer evidence: ${evidence}`;
  }
}
