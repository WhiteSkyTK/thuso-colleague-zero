import { z } from 'zod';
import type { PlanStep } from './plan';
import { ReviewVerdictSchema, type ReviewVerdict } from './review';
import type { WorkOutput } from './step';

/** One rejected draft: what it was, why it failed and what changed next. */
export const RevisionSchema = z.object({
  attempt: z.number().int().positive(),
  payload: z.unknown(),
  verdict: ReviewVerdictSchema,
  reason: z.string(),
});
export type Revision = z.infer<typeof RevisionSchema>;

export const WorkItemSchema = z.object({
  id: z.string().min(1),
  /** The plan step that produced this item. */
  stepId: z.string().min(1),
  /** Who or what the work is about, e.g. a learner id. */
  subjectId: z.string().min(1),
  payload: z.unknown(),
  attempt: z.number().int().positive(),
  history: z.array(RevisionSchema),
});
export type WorkItem<T = unknown> = Omit<z.infer<typeof WorkItemSchema>, 'payload'> & {
  payload: T;
};

/** Wraps an agent's first output for a subject into a tracked work item. */
export function createWorkItem(step: PlanStep, output: WorkOutput): WorkItem {
  return {
    id: `${step.id}:${output.subjectId}`,
    stepId: step.id,
    subjectId: output.subjectId,
    payload: output.payload,
    attempt: 1,
    history: [],
  };
}

/** A new attempt at the same item; the rejected draft is kept in its history. */
export function reviseWorkItem(
  previous: WorkItem,
  output: WorkOutput,
  verdict: ReviewVerdict,
): WorkItem {
  const revision: Revision = {
    attempt: previous.attempt,
    payload: previous.payload,
    verdict,
    reason: output.changeNote ?? verdict.fixInstructions ?? '',
  };
  return {
    ...previous,
    payload: output.payload,
    attempt: previous.attempt + 1,
    history: [...previous.history, revision],
  };
}
