import type { PlanStep } from './plan';
import type { ReviewVerdict } from './review';
import type { WorkItem } from './workItem';

/** A reviewer rejected `previous`; the agent that produced it must revise it. */
export interface FixRequest {
  previous: WorkItem;
  verdict: ReviewVerdict;
}

/** Work the orchestrator hands to an agent for one plan step. */
export interface StepRequest {
  step: PlanStep;
  /** Upstream work: exactly one item for "each" actions, all of them for "once" actions. */
  items: readonly WorkItem[];
  fix?: FixRequest;
}

/** One piece of produced work. The orchestrator wraps it into a WorkItem. */
export interface WorkOutput {
  subjectId: string;
  payload: unknown;
  /** For a fix: what changed and why (goes into the item's history). */
  changeNote?: string;
}

/** Agents either produce work or judge it. A verdict triggers the correction loop. */
export type StepResult =
  { kind: 'outputs'; outputs: WorkOutput[] } | { kind: 'verdict'; verdict: ReviewVerdict };
