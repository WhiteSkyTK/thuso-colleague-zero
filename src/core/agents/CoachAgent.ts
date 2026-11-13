import { TEMPERATURE } from '../config/constants';
import { CatchUpPlanSchema, type CatchUpPlan } from '../domain/catchUpPlan';
import type { Resource } from '../domain/classData';
import { DiagnosisSchema, type Diagnosis } from '../domain/diagnosis';
import type { FixRequest, StepRequest, StepResult } from '../domain/step';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { COACH_PROMPT, toPrompt } from '../prompts/prompts';
import type { ResourceCatalog, SchoolCalendar } from '../repositories/ClassRepository';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import { singleItem } from './singleItem';
import type { StepAgent } from './StepAgent';

export interface CoachSources {
  catalog: ResourceCatalog;
  calendar: SchoolCalendar;
}

/** CO — writes each at-risk learner's 2-week catch-up plan, and rewrites it when reviewed. */
export class CoachAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'draft-plan': {
      description:
        'Write a 2-week catch-up plan for one diagnosed learner: scaffolded sessions in the ' +
        "learner's preferred format, a booked support session, and messages.",
      scope: 'each',
      handle: (request, ctx) => this.draftPlan(request, ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(
    llm: LlmProvider,
    private readonly sources: CoachSources,
  ) {
    super('CO', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async draftPlan(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const source = singleItem(request);
    const diagnosis = DiagnosisSchema.parse(source.payload);
    const resources = this.resourcesFor(diagnosis);
    if (!request.fix) {
      this.noteCatalogueGaps(diagnosis, resources, ctx);
    }
    const input = {
      diagnosis,
      resources,
      freeSlots: this.sources.calendar.days(),
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

  /** Only the resources for the learner's weak topics go to the model. */
  private resourcesFor(diagnosis: Diagnosis): Resource[] {
    const topics = new Set(diagnosis.weakTopics.map((weak) => weak.topic));
    return this.sources.catalog
      .forSubject(diagnosis.subjectId)
      .filter((resource) => topics.has(resource.topic));
  }

  private noteCatalogueGaps(diagnosis: Diagnosis, resources: Resource[], ctx: RunContext): void {
    const covered = new Set(resources.map((resource) => resource.topic));
    const uncovered = diagnosis.weakTopics
      .map((weak) => weak.topic)
      .filter((topic) => !covered.has(topic));
    if (uncovered.length > 0) {
      ctx.note(
        `The resource catalogue has nothing for ${uncovered.join(', ')} (needed by ${diagnosis.learnerId}) — sessions are teacher-led until resources are added.`,
      );
    }
  }

  /** Every fix is logged with its reason (CLAUDE.md §7.5). */
  private describeFix(plan: CatchUpPlan, fix: FixRequest): string {
    const evidence = fix.verdict.issues.map((issue) => issue.evidence).join('; ') || 'reviewer feedback';
    return `${plan.learnerId}: plan rewritten — reviewer evidence: ${evidence}. Now: ${plan.summary}`;
  }
}
