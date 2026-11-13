import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { LlmOutputError } from '@/core/errors/AppError';
import { AnthropicProvider } from '@/core/llm/AnthropicProvider';
import type { LlmRequest } from '@/core/llm/LlmProvider';

type CreateParams = Parameters<Anthropic['beta']['messages']['create']>[0];

const REQUEST: LlmRequest = {
  task: 'coach.draft-plan',
  tier: 'reasoning',
  system: 'You are the Coach.',
  prompt: 'Plan.',
};
const Schema = z.object({ topic: z.string(), days: z.number().int().min(1) });

/** A fake Messages API that answers from a script and records what it was sent. */
function fakeMessages(replies: { text: string; stop?: string; category?: string }[]) {
  const sent: CreateParams[] = [];
  const create = (params: CreateParams) => {
    sent.push(params);
    const reply = replies[sent.length - 1] ?? { text: '' };
    return Promise.resolve({
      content: [{ type: 'text', text: reply.text }],
      stop_reason: reply.stop ?? 'end_turn',
      stop_details: reply.category ? { type: 'refusal', category: reply.category } : null,
      usage: { input_tokens: 100, output_tokens: 20 },
    });
  };
  return { sent, messages: { create } as unknown as Pick<Anthropic['beta']['messages'], 'create'> };
}

const providerWith = (messages: Pick<Anthropic['beta']['messages'], 'create'>) =>
  new AnthropicProvider({
    apiKey: 'test-key',
    models: { reasoning: 'model-reasoning', fast: 'model-fast' },
    timeoutMs: 1000,
    messages,
  });

describe('AnthropicProvider', () => {
  it('asks for structured output on the reasoning model, with effort and fallbacks, and validates it', async () => {
    const fake = fakeMessages([{ text: '{"topic":"algebra","days":3}' }]);
    const result = await providerWith(fake.messages).completeStructured(Schema, REQUEST);
    expect(result).toEqual({
      value: { topic: 'algebra', days: 3 },
      usage: { input: 100, output: 20 },
    });
    const params = fake.sent[0];
    expect(params?.model).toBe('model-reasoning');
    expect(params?.output_config?.effort).toBe('medium');
    expect(params?.output_config?.format?.type).toBe('json_schema');
    expect(params?.fallbacks).toBe('default');
    expect(params).not.toHaveProperty('temperature');
  });

  it('repairs once with the validation error in the prompt', async () => {
    const fake = fakeMessages([
      { text: '{"topic":"algebra","days":0}' },
      { text: '{"topic":"algebra","days":2}' },
    ]);
    const result = await providerWith(fake.messages).completeStructured(Schema, REQUEST);
    expect(result.value.days).toBe(2);
    expect(result.usage).toEqual({ input: 200, output: 40 });
    expect(JSON.stringify(fake.sent[1]?.messages)).toContain('failed validation');
  });

  it('turns a refusal into a typed error the orchestrator can escalate', async () => {
    const fake = fakeMessages([{ text: '', stop: 'refusal', category: 'general_harms' }]);
    await expect(
      providerWith(fake.messages).complete({ ...REQUEST, tier: 'fast' }),
    ).rejects.toThrow(LlmOutputError);
    expect(fake.sent[0]?.model).toBe('model-fast');
    expect(fake.sent[0]?.output_config?.effort).toBe('low');
  });
});
