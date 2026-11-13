import type { PlanStep } from '../domain/plan';
import type { ReviewVerdict } from '../domain/review';
import { reviseWorkItem, type WorkItem } from '../domain/workItem';
import { StepFailedError } from '../errors/AppError';
import type { AgentRegistry } from './AgentRegistry';
import type { RunContext } from './RunContext';

export interface ReviewCase {
  /** The review step that judged the item. */
  reviewStep: PlanStep;
  item: WorkItem;
  verdict: ReviewVerdict;
}

/**
 * Check → correct → check again. A failed item goes back to the agent that made
 * it with the reviewer's fix instructions, and the new draft is reviewed again.
 * Bounded by `maxAttempts`; after that the item is escalated to a person.
 */
export class CorrectionLoop {
  constructor(private readonly registry: AgentRegistry) {}

  /** @returns the approved item, or undefined when it was escalated. */
  async resolve(reviewCase: ReviewCase, ctx: RunContext): Promise<WorkItem | undefined> {
    let { item, verdict } = reviewCase;
    // Bounded: every pass through the loop raises item.attempt by one.
    while (verdict.status === 'fail' && item.attempt < ctx.limits.maxAttempts) {
      item = await this.fix(item, verdict, ctx);
      verdict = await this.review(reviewCase.reviewStep, item, ctx);
    }
    if (verdict.status === 'pass') {
      return item;
    }
    const evidence = verdict.issues[0]?.evidence ?? 'review failed';
    ctx.escalate(item, `still failing after ${item.attempt} attempts: ${evidence}`);
    return undefined;
  }

  private async fix(item: WorkItem, verdict: ReviewVerdict, ctx: RunContext): Promise<WorkItem> {
    const step = this.producerOf(item, ctx);
    const source = ctx.upstreamFor(step.id, item.subjectId);
    const result = await this.registry
      .get(step.agent)
      .execute({ step, items: source ? [source] : [], fix: { previous: item, verdict } }, ctx);
    const output = result.kind === 'outputs' ? result.outputs[0] : undefined;
    if (!output) {
      throw new StepFailedError(`${step.agent} returned no revised work for ${item.subjectId}`);
    }
    ctx.recordFix();
    return reviseWorkItem(item, output, verdict);
  }

  private async review(step: PlanStep, item: WorkItem, ctx: RunContext): Promise<ReviewVerdict> {
    const result = await this.registry.get(step.agent).execute({ step, items: [item] }, ctx);
    if (result.kind !== 'verdict') {
      throw new StepFailedError(`${step.agent} did not return a verdict for ${item.subjectId}`);
    }
    return result.verdict;
  }

  private producerOf(item: WorkItem, ctx: RunContext): PlanStep {
    const step = ctx.plan?.steps.find((candidate) => candidate.id === item.stepId);
    if (!step) {
      throw new StepFailedError(`no plan step produced ${item.id}`);
    }
    return step;
  }
}
