import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { z } from 'zod';
import { LlmOutputError } from '../errors/AppError';
import type { LlmProvider, LlmRequest, LlmResult, ModelTier, TokenUsage } from './LlmProvider';
import { parseWithRepair } from './parseWithRepair';

/** Room for a full catch-up plan; non-streaming requests stay well inside SDK timeouts. */
const DEFAULT_MAX_TOKENS = 16_000;
const MAX_RETRIES = 2;
/** Server-side retry on a substitute model if the requested one declines (no model list to maintain). */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
/** Reasoning work (plans, diagnoses, reviews) thinks harder than message writing. */
const EFFORT: Record<ModelTier, 'low' | 'medium'> = { reasoning: 'medium', fast: 'low' };

type MessagesApi = Pick<Anthropic['beta']['messages'], 'create'>;
type BetaMessage = Anthropic.Beta.BetaMessage;

export interface AnthropicProviderOptions {
  apiKey: string;
  /** From LLM_MODEL_REASONING and LLM_MODEL_FAST — never hard-coded. */
  models: Record<ModelTier, string>;
  timeoutMs: number;
  /** Tests inject a fake; production builds the real client. */
  messages?: MessagesApi;
}

const textOf = (message: BetaMessage): string =>
  message.content
    .flatMap((block) => (block.type === 'text' ? [block.text] : []))
    .join('')
    .trim();

const usageOf = (message: BetaMessage): TokenUsage => ({
  input: message.usage.input_tokens,
  output: message.usage.output_tokens,
});

/** The repair note travels with the prompt so the model sees exactly what failed validation. */
const promptOf = (request: LlmRequest): string =>
  request.repairNote
    ? `${request.prompt}\n\nYour previous answer failed validation: ${request.repairNote}\nReturn a corrected answer.`
    : request.prompt;

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Not JSON at all: hand the text to the schema so the repair retry gets a precise error.
    return text;
  }
}

/**
 * Claude behind the LlmProvider strategy. Structured calls use JSON structured outputs built
 * from the agent's own Zod schema, then the shared validate-and-repair path. Temperature is
 * not sent: current Claude models reject sampling parameters, so effort sets the depth instead.
 */
export class AnthropicProvider implements LlmProvider {
  readonly name = 'anthropic';
  private readonly messages: MessagesApi;

  constructor(private readonly options: AnthropicProviderOptions) {
    this.messages =
      options.messages ??
      new Anthropic({ apiKey: options.apiKey, timeout: options.timeoutMs, maxRetries: MAX_RETRIES })
        .beta.messages;
  }

  async complete(request: LlmRequest): Promise<LlmResult<string>> {
    const message = await this.send(request);
    return { value: textOf(message), usage: usageOf(message) };
  }

  completeStructured<T>(schema: z.ZodType<T>, request: LlmRequest): Promise<LlmResult<T>> {
    return parseWithRepair(schema, async (repairNote) => {
      const message = await this.send({ ...request, repairNote }, schema);
      return { raw: parseJson(textOf(message)), usage: usageOf(message) };
    });
  }

  private async send(request: LlmRequest, schema?: z.ZodType): Promise<BetaMessage> {
    const message = await this.messages.create({
      model: this.options.models[request.tier],
      max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: request.system,
      messages: [{ role: 'user', content: promptOf(request) }],
      output_config: {
        effort: EFFORT[request.tier],
        ...(schema ? { format: betaZodOutputFormat(schema) } : {}),
      },
      betas: [FALLBACK_BETA],
      fallbacks: 'default',
    });
    if (message.stop_reason === 'refusal') {
      const category = message.stop_details?.category ?? 'unspecified';
      throw new LlmOutputError(`The model declined ${request.task} (${category}).`);
    }
    if (message.stop_reason === 'max_tokens') {
      throw new LlmOutputError(`The answer to ${request.task} was cut off at max_tokens.`);
    }
    return message;
  }
}
