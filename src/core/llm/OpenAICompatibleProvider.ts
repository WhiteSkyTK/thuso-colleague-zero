import { z } from 'zod';
import { LlmOutputError } from '../errors/AppError';
import type { LlmProvider, LlmRequest, LlmResult, TokenUsage } from './LlmProvider';
import { parseWithRepair } from './parseWithRepair';

const DEFAULT_MAX_TOKENS = 8_000;
const DEFAULT_TEMPERATURE = 0.2;

export interface OpenAICompatibleOptions {
  /** e.g. https://generativelanguage.googleapis.com/v1beta/openai (Gemini), https://openrouter.ai/api/v1 */
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  /** Tests inject a fake; production uses the global fetch. */
  fetchFn?: typeof fetch;
}

const ChatResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
  usage: z
    .object({ prompt_tokens: z.number(), completion_tokens: z.number() })
    .partial()
    .optional(),
});

function parseJson(text: string): unknown {
  // Some models wrap JSON in a ```json fence even when asked not to.
  const unfenced = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(unfenced) as unknown;
  } catch {
    return text;
  }
}

/**
 * Any OpenAI-compatible chat endpoint (Gemini, OpenRouter, NVIDIA NIM) behind the LlmProvider
 * strategy. Structured calls ask for a JSON object that matches the agent's Zod schema, then go
 * through the same validate-and-repair path as Claude.
 */
export class OpenAICompatibleProvider implements LlmProvider {
  readonly name = 'openai-compatible';

  constructor(private readonly options: OpenAICompatibleOptions) {}

  async complete(request: LlmRequest): Promise<LlmResult<string>> {
    const { text, usage } = await this.chat(request);
    return { value: text, usage };
  }

  completeStructured<T>(schema: z.ZodType<T>, request: LlmRequest): Promise<LlmResult<T>> {
    const jsonSchema = JSON.stringify(z.toJSONSchema(schema, { unrepresentable: 'any' }));
    return parseWithRepair(schema, async (repairNote) => {
      const { text, usage } = await this.chat({ ...request, repairNote }, jsonSchema);
      return { raw: parseJson(text), usage };
    });
  }

  private async chat(
    request: LlmRequest,
    jsonSchema?: string,
  ): Promise<{ text: string; usage: TokenUsage }> {
    const { baseUrl, apiKey, model, timeoutMs, fetchFn = fetch } = this.options;
    const system = jsonSchema
      ? `${request.system}\n\nReply with one JSON object only, no prose, matching this JSON Schema:\n${jsonSchema}`
      : request.system;
    const prompt = request.repairNote
      ? `${request.prompt}\n\nYour previous answer failed validation: ${request.repairNote}\nReturn a corrected answer.`
      : request.prompt;
    const response = await fetchFn(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: request.temperature ?? DEFAULT_TEMPERATURE,
        ...(jsonSchema ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      // Status only: provider error bodies can echo request details.
      throw new LlmOutputError(`${request.task}: the model endpoint answered ${response.status}.`);
    }
    const parsed = ChatResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new LlmOutputError(`${request.task}: unexpected response from the model endpoint.`);
    }
    return {
      text: parsed.data.choices[0]?.message.content?.trim() ?? '',
      usage: {
        input: parsed.data.usage?.prompt_tokens ?? 0,
        output: parsed.data.usage?.completion_tokens ?? 0,
      },
    };
  }
}
