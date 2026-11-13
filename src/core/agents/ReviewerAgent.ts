import { TEMPERATURE } from '../config/constants';
import type { ReviewCheck, ReviewSubject } from '../checks/ReviewCheck';
import { CatchUpPlanSchema } from '../domain/catchUpPlan';
import { DiagnosisSchema } from '../domain/diagnosis';
import { ReviewVerdictSchema, type CheckResult, type ReviewVerdict } from '../domain/review';
import type { StepRequest, StepResult } from '../domain/step';
import type { WorkItem } from '../domain/workItem';
import { StepFailedError } from '../errors/AppError';
import type { LlmProvider } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { REVIEWER_PROMPT, toPrompt } from '../prompts/prompts';
import { ActionTable } from './ActionTable';
import { Agent } from './Agent';
import { singleItem } from './singleItem';
import type { StepAgent } from './StepAgent';

/** RV — deterministic checks first, then a model rubric review. Read-only. */
export class ReviewerAgent extends Agent<StepRequest, StepResult> implements StepAgent {
  private readonly table = new ActionTable({
    'review-plan': {
      description: 'Check one drafted plan against the evidence; failures go back to be fixed.',
      scope: 'each',
      handle: (request, ctx) => this.reviewPlan(request, ctx),
    },
  });

  readonly actions = this.table.specs;

  constructor(
    llm: LlmProvider,
    private readonly checks: readonly ReviewCheck[],
  ) {
    super('RV', llm);
  }

  protected run(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    return this.table.dispatch(request, ctx);
  }

  private async reviewPlan(request: StepRequest, ctx: RunContext): Promise<StepResult> {
    const item = singleItem(request);
    const subject = this.subjectOf(item, ctx);
    const failures = this.checks
      .map((check) => check(subject))
      .filter((result) => !result.passed && result.severity === 'error');
    const verdict = failures.length > 0 ? this.reject(failures) : await this.judge(subject, ctx);
    this.announce(item, verdict, ctx);
    return { kind: 'verdict', verdict };
  }

  private subjectOf(item: WorkItem, ctx: RunContext): ReviewSubject {
    const source = ctx.upstreamFor(item.stepId, item.subjectId);
    if (!source) {
      throw new StepFailedError(`no diagnosis found for ${item.subjectId}`);
    }
    return {
      plan: CatchUpPlanSchema.parse(item.payload),
      diagnosis: DiagnosisSchema.parse(source.payload),
      constraints: ctx.goal.constraints,
    };
  }

  /** A code check failed — no model call needed; the fix hints are the instructions. */
  private reject(failures: CheckResult[]): ReviewVerdict {
    return {
      status: 'fail',
      issues: failures,
      fixInstructions: failures.map((failure) => failure.fixHint).join(' '),
    };
  }

  private async judge(subject: ReviewSubject, ctx: RunContext): Promise<ReviewVerdict> {
    const asked = await this.ask(ctx, ReviewVerdictSchema, {
      task: 'reviewer.review-plan',
      tier: 'reasoning',
      system: REVIEWER_PROMPT,
      prompt: toPrompt(subject),
      input: subject,
      temperature: TEMPERATURE.review,
    });
    return asked.value;
  }

  private announce(item: WorkItem, verdict: ReviewVerdict, ctx: RunContext): void {
    const isPass = verdict.status === 'pass';
    const evidence = verdict.issues[0]?.evidence ?? 'rubric review failed';
    this.say(ctx, {
      level: isPass ? 'PASS' : 'FLAG',
      itemId: item.subjectId,
      message: isPass
        ? `${item.subjectId}: plan approved (attempt ${item.attempt}).`
        : `${item.subjectId}: ${evidence}.`,
      data: { attempt: item.attempt, issues: verdict.issues },
    });
  }
}
