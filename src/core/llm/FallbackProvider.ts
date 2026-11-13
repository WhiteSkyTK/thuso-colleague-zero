import type { z } from 'zod';
import type { LlmProvider, LlmRequest, LlmResult } from './LlmProvider';

/**
 * Tries each provider in order and returns the first answer (e.g. Claude, then Gemini). A call
 * fails only when every provider failed; the last error is the one reported.
 */
export class FallbackProvider implements LlmProvider {
  readonly name: string;

  constructor(private readonly providers: readonly LlmProvider[]) {
    this.name = providers.map((provider) => provider.name).join('→');
  }

  complete(request: LlmRequest): Promise<LlmResult<string>> {
    return this.firstThatWorks((provider) => provider.complete(request));
  }

  completeStructured<T>(schema: z.ZodType<T>, request: LlmRequest): Promise<LlmResult<T>> {
    return this.firstThatWorks((provider) => provider.completeStructured(schema, request));
  }

  /** Each provider is tried only after the one before it failed; the last error is reported. */
  private firstThatWorks<R>(call: (provider: LlmProvider) => Promise<R>): Promise<R> {
    return this.providers.reduce<Promise<R>>(
      (attempt, provider) => attempt.catch(() => call(provider)),
      Promise.reject(new Error('No model provider is configured.')),
    );
  }
}
