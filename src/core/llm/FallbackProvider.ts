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

  private async firstThatWorks<R>(call: (provider: LlmProvider) => Promise<R>): Promise<R> {
    let lastError: unknown = new Error('No model provider is configured.');
    for (const provider of this.providers) {
      try {
        return await call(provider);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}
