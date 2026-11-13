import type { z } from 'zod';

/** `reasoning` → LLM_MODEL_REASONING, `fast` → LLM_MODEL_FAST. */
export type ModelTier = 'reasoning' | 'fast';

export interface TokenUsage {
  input: number;
  output: number;
}

export interface LlmRequest {
  /** Stable id of the calling task, e.g. `coach.draft-plan` (logs, cache key, mock script). */
  task: string;
  tier: ModelTier;
  system: string;
  prompt: string;
  /** The structured data the prompt was built from (cache key, mock script). */
  input?: unknown;
  temperature?: number;
  maxTokens?: number;
  /** Set on the repair retry: the validation error from the first answer. */
  repairNote?: string;
}

export interface LlmResult<T> {
  value: T;
  usage: TokenUsage;
}

/** Strategy: every model backend looks the same to the agents. */
export interface LlmProvider {
  readonly name: string;
  complete(request: LlmRequest): Promise<LlmResult<string>>;
  /** Returns output that has passed `schema`; one repair retry, then LlmOutputError. */
  completeStructured<T>(schema: z.ZodType<T>, request: LlmRequest): Promise<LlmResult<T>>;
}
