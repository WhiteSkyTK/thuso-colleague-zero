import { TOKENS_PER_MILLION } from '../config/constants';
import { BudgetExceededError } from '../errors/AppError';
import type { TokenUsage } from '../llm/LlmProvider';
import type { Clock } from './Clock';

export interface BudgetLimits {
  tokenBudget: number;
  maxSteps: number;
  runTimeoutMs: number;
  /** Price per million tokens, used only for the cost estimate in the summary. */
  costPerMTok: TokenUsage;
}

/** Bounded autonomy (CLAUDE.md §7.6): tokens, plan steps and run time all have a ceiling. */
export class Budget {
  private used: TokenUsage = { input: 0, output: 0 };
  private steps = 0;
  private readonly startedAt: number;

  constructor(
    private readonly limits: BudgetLimits,
    private readonly clock: Clock,
  ) {
    this.startedAt = clock.now();
  }

  get usage(): TokenUsage {
    return { ...this.used };
  }

  get totalTokens(): number {
    return this.used.input + this.used.output;
  }

  /** Adds the tokens of one model call, then checks the ceilings. */
  charge(usage: TokenUsage): void {
    this.used = {
      input: this.used.input + usage.input,
      output: this.used.output + usage.output,
    };
    this.assertWithin();
  }

  /** Counts one plan step (not one work item). */
  countStep(): void {
    this.steps += 1;
    if (this.steps > this.limits.maxSteps) {
      throw new BudgetExceededError(`step limit of ${this.limits.maxSteps} reached`);
    }
  }

  /** @throws BudgetExceededError when the token budget or the run timeout is exceeded. */
  assertWithin(): void {
    if (this.totalTokens > this.limits.tokenBudget) {
      throw new BudgetExceededError(`token budget of ${this.limits.tokenBudget} used up`);
    }
    if (this.clock.now() - this.startedAt > this.limits.runTimeoutMs) {
      throw new BudgetExceededError(`run timeout of ${this.limits.runTimeoutMs} ms passed`);
    }
  }

  estimateCost(): number {
    const { input, output } = this.limits.costPerMTok;
    return (this.used.input * input + this.used.output * output) / TOKENS_PER_MILLION;
  }
}
