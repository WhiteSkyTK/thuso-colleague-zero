import type { z } from 'zod';
import type { EventDraft } from '../domain/agentEvent';
import type { AgentCode } from '../domain/codes';
import { AppError, BudgetExceededError, StepFailedError } from '../errors/AppError';
import type { LlmProvider, LlmRequest } from '../llm/LlmProvider';
import type { RunContext } from '../orchestrator/RunContext';
import { withTimeout } from '../orchestrator/withTimeout';

/** The validated answer of one model call, with what it cost. */
export interface Asked<T> {
  value: T;
  tokens: number;
  ms: number;
}

/**
 * Template Method base for every agent. `execute()` owns the budget gate and
 * error reporting; subclasses implement only `run()`.
 */
export abstract class Agent<I, O> {
  constructor(
    readonly code: AgentCode,
    protected readonly llm: LlmProvider,
  ) {}

  async execute(input: I, ctx: RunContext): Promise<O> {
    ctx.budget.assertWithin();
    try {
      return await this.run(input, ctx);
    } catch (error) {
      throw this.report(error, ctx);
    }
  }

  protected abstract run(input: I, ctx: RunContext): Promise<O>;

  /** Publishes a log line under this agent's code. */
  protected say(ctx: RunContext, event: Omit<EventDraft, 'agent'>): void {
    ctx.emit({ ...event, agent: this.code });
  }

  /** One model call: bounded by the call timeout, schema-validated, charged to the budget. */
  protected async ask<T>(
    ctx: RunContext,
    schema: z.ZodType<T>,
    request: LlmRequest,
  ): Promise<Asked<T>> {
    const startedAt = ctx.elapsedMs;
    const result = await withTimeout(
      this.llm.completeStructured(schema, request),
      ctx.limits.callTimeoutMs,
      request.task,
    );
    ctx.budget.charge(result.usage);
    return {
      value: result.value,
      tokens: result.usage.input + result.usage.output,
      ms: ctx.elapsedMs - startedAt,
    };
  }

  /** Budget errors pass through untouched; everything else becomes a logged step failure. */
  private report(error: unknown, ctx: RunContext): AppError {
    if (error instanceof BudgetExceededError) {
      return error;
    }
    const reason = error instanceof Error ? error.message : 'unknown error';
    this.say(ctx, { level: 'ERROR', message: reason });
    return error instanceof AppError ? error : new StepFailedError(reason, { cause: error });
  }
}
