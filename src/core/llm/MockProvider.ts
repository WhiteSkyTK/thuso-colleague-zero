import type { z } from 'zod';
import { CHARS_PER_TOKEN } from '../config/constants';
import type { LlmProvider, LlmRequest, LlmResult, TokenUsage } from './LlmProvider';
import { parseWithRepair } from './parseWithRepair';

/** Stands in for the model: gets the request, returns what the model would have said. */
export type MockResponder = (request: LlmRequest) => unknown;

const estimateTokens = (textLength: number): number => Math.ceil(textLength / CHARS_PER_TOKEN);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Offline provider for tests, CI and the fallback demo. Its answers go through
 * the same validation and repair path as a real model's.
 */
export class MockProvider implements LlmProvider {
  readonly name = 'mock';

  constructor(
    private readonly responder: MockResponder,
    private readonly latencyMs = 0,
  ) {}

  async complete(request: LlmRequest): Promise<LlmResult<string>> {
    const raw = await this.respond(request);
    const value = typeof raw === 'string' ? raw : JSON.stringify(raw);
    return { value, usage: this.usageFor(request, value) };
  }

  completeStructured<T>(schema: z.ZodType<T>, request: LlmRequest): Promise<LlmResult<T>> {
    return parseWithRepair(schema, async (repairNote) => {
      const raw = await this.respond({ ...request, repairNote });
      return { raw, usage: this.usageFor(request, JSON.stringify(raw) ?? '') };
    });
  }

  private async respond(request: LlmRequest): Promise<unknown> {
    if (this.latencyMs > 0) {
      await sleep(this.latencyMs);
    }
    return this.responder(request);
  }

  private usageFor(request: LlmRequest, output: string): TokenUsage {
    return {
      input: estimateTokens(request.system.length + request.prompt.length),
      output: estimateTokens(output.length),
    };
  }
}
