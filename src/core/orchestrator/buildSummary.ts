import type { RunSummary } from '../domain/runSummary';
import type { RunContext } from './RunContext';

/** The honest end-of-run report: escalations are listed and counted, never hidden. */
export function buildSummary(ctx: RunContext, stopReason?: string): RunSummary {
  return {
    goal: ctx.goal.text,
    status: stopReason ? 'stopped' : 'completed',
    stopReason,
    stepsCompleted: ctx.completedStepIds.length,
    stepsTotal: ctx.plan?.steps.length ?? 0,
    itemsDelivered: ctx.deliveredCount,
    fixes: ctx.fixes,
    escalations: [...ctx.escalations],
    teacherNotes: ctx.teacherNotes,
    humanInterventions: ctx.escalations.length,
    durationMs: ctx.elapsedMs,
    tokens: ctx.budget.totalTokens,
    estCost: ctx.budget.estimateCost(),
  };
}
