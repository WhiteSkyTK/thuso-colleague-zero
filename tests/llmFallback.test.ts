import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { LlmOutputError } from '@/core/errors/AppError';
import { FallbackProvider } from '@/core/llm/FallbackProvider';
import type { LlmProvider, LlmRequest } from '@/core/llm/LlmProvider';
import { OpenAICompatibleProvider } from '@/core/llm/OpenAICompatibleProvider';

const REQUEST: LlmRequest = {
  task: 'analyst.explain',
  tier: 'reasoning',
  system: 'You explain.',
  prompt: 'Why?',
};
const Schema = z.object({ cause: z.string(), score: z.number().min(0).max(100) });

function fakeFetch(replies: { status?: number; content: string }[]) {
  const bodies: Record<string, unknown>[] = [];
  const fetchFn = (_url: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const reply = replies[bodies.length - 1] ?? { content: '' };
    return Promise.resolve(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: reply.content } }],
          usage: { prompt_tokens: 50, completion_tokens: 10 },
        }),
        { status: reply.status ?? 200 },
      ),
    );
  };
  return { bodies, fetchFn: fetchFn as typeof fetch };
}

const providerWith = (fetchFn: typeof fetch) =>
  new OpenAICompatibleProvider({
    baseUrl: 'https://example.org/v1/',
    apiKey: 'k',
    model: 'm',
    timeoutMs: 1000,
    fetchFn,
  });

describe('OpenAICompatibleProvider', () => {
  it('asks for a JSON object matching the schema, strips a code fence and validates', async () => {
    const fake = fakeFetch([{ content: '```json\n{"cause":"attendance","score":58}\n```' }]);
    const result = await providerWith(fake.fetchFn).completeStructured(Schema, REQUEST);
    expect(result).toEqual({
      value: { cause: 'attendance', score: 58 },
      usage: { input: 50, output: 10 },
    });
    expect(fake.bodies[0]?.response_format).toEqual({ type: 'json_object' });
    expect(JSON.stringify(fake.bodies[0]?.messages)).toContain('JSON Schema');
  });

  it('repairs once with the validation error, and reports a failed endpoint by status only', async () => {
    const fake = fakeFetch([
      { content: '{"cause":"x","score":500}' },
      { content: '{"cause":"x","score":50}' },
    ]);
    expect((await providerWith(fake.fetchFn).completeStructured(Schema, REQUEST)).value.score).toBe(
      50,
    );
    const failing = fakeFetch([{ status: 429, content: '' }]);
    await expect(providerWith(failing.fetchFn).complete(REQUEST)).rejects.toThrow('answered 429');
  });
});

describe('FallbackProvider', () => {
  const failing: LlmProvider = {
    name: 'claude',
    complete: () => Promise.reject(new LlmOutputError('no credit')),
    completeStructured: () => Promise.reject(new LlmOutputError('no credit')),
  };
  const working: LlmProvider = {
    name: 'gemini',
    complete: () => Promise.resolve({ value: 'ok', usage: { input: 1, output: 1 } }),
    completeStructured: <T>() =>
      Promise.resolve({ value: { cause: 'x', score: 1 } as T, usage: { input: 1, output: 1 } }),
  };

  it('uses the next provider when the first fails, and fails only when all do', async () => {
    const chain = new FallbackProvider([failing, working]);
    expect(chain.name).toBe('claude→gemini');
    expect((await chain.complete(REQUEST)).value).toBe('ok');
    await expect(new FallbackProvider([failing]).complete(REQUEST)).rejects.toThrow('no credit');
  });
});
