/** Base class for every error the engine raises on purpose. */
export abstract class AppError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** Environment or wiring problem found at startup. */
export class ConfigError extends AppError {
  readonly code = 'CONFIG_INVALID';
}

/** A run-wide limit was hit (tokens, steps or run time). The run stops cleanly. */
export class BudgetExceededError extends AppError {
  readonly code = 'BUDGET_EXCEEDED';
}

/** One call took longer than the per-call timeout. */
export class TimeoutError extends AppError {
  readonly code = 'TIMEOUT';
}

/** Model output failed schema validation even after the repair retry. */
export class LlmOutputError extends AppError {
  readonly code = 'LLM_OUTPUT_INVALID';
}

/** An agent could not finish its step. */
export class StepFailedError extends AppError {
  readonly code = 'STEP_FAILED';
}

/** The Planner produced a plan the orchestrator cannot run. */
export class PlanInvalidError extends AppError {
  readonly code = 'PLAN_INVALID';
}
