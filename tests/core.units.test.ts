import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { loadConfig } from '@/core/config/env';
import { BudgetExceededError, ConfigError, LlmOutputError, TimeoutError } from '@/core/errors/AppError';
import { EventBus } from '@/core/events/EventBus';
import { formatElapsed, formatEvent } from '@/core/events/formatEvent';
import { MockProvider } from '@/core/llm/MockProvider';
import type { LlmRequest } from '@/core/llm/LlmProvider';
import { Budget } from '@/core/orchestrator/Budget';
import { mapWithLimit } from '@/core/orchestrator/Concurrency';
import { withTimeout } from '@/core/orchestrator/withTimeout';
import { ManualClock } from './helpers/testKit';

const REQUEST: LlmRequest = { task: 'test', tier: 'fast', system: 'sys', prompt: 'prompt' };

describe('loadConfig', () => {
  it('defaults to the offline mock provider with the documented limits', () => {
    const config = loadConfig({});
    expect(config.llm.provider).toBe('mock');
    expect(config.run).toEqual({ maxAttempts: 3, maxSteps: 25, timeoutMs: 600_000, tokenBudget: 400_000 });
    expect(config.rules).toEqual({ riskThreshold: 40, maxHoursPerWeek: 4 });
    expect(config.delivery.mode).toBe('sandbox');
  });

  it('treats blank values as unset and coerces numbers', () => {
    const config = loadConfig({ RUN_MAX_ATTEMPTS: '', LLM_CONCURRENCY: '8', LLM_CACHE: 'off' });
    expect(config.run.maxAttempts).toBe(3);
    expect(config.llm.concurrency).toBe(8);
    expect(config.llm.isCacheOn).toBe(false);
  });

  it('fails fast and names the bad key, never its value', () => {
    expect(() => loadConfig({ RUN_MAX_STEPS: 'secret-looking-value' })).toThrow(ConfigError);
    expect(() => loadConfig({ RUN_MAX_STEPS: 'secret-looking-value' })).toThrow(/RUN_MAX_STEPS/);
    expect(() => loadConfig({ RUN_MAX_STEPS: 'secret-looking-value' })).not.toThrow(/secret-looking/);
  });

  it('requires the keys of the chosen provider', () => {
    expect(() => loadConfig({ LLM_PROVIDER: 'anthropic' })).toThrow(/ANTHROPIC_API_KEY/);
  });
});

describe('EventBus and formatEvent', () => {
  it('delivers events to subscribers until they unsubscribe', () => {
    const bus = new EventBus();
    const seen: string[] = [];
    const unsubscribe = bus.subscribe((event) => seen.push(event.message));
    const event = { runId: 'r', seq: 0, ts: 0, agent: 'SYS', level: 'INFO', message: 'one' } as const;
    bus.publish(event);
    unsubscribe();
    bus.publish({ ...event, message: 'two' });
    expect(seen).toEqual(['one']);
  });

  it('prints the organisers log format', () => {
    const line = formatEvent({
      runId: 'r',
      seq: 3,
      ts: 411_000,
      agent: 'RV',
      level: 'FLAG',
      message: 'L-014: plan targets algebra, but 9 absences in 6 weeks.',
    });
    expect(line).toBe('00:06:51 [RV·FLAG] L-014: plan targets algebra, but 9 absences in 6 weeks.');
    expect(formatElapsed(3_723_000)).toBe('01:02:03');
  });
});

describe('MockProvider', () => {
  it('returns validated structured output and estimates tokens', async () => {
    const provider = new MockProvider(() => ({ answer: 42 }));
    const result = await provider.completeStructured(z.object({ answer: z.number() }), REQUEST);
    expect(result.value).toEqual({ answer: 42 });
    expect(result.usage.input).toBeGreaterThan(0);
    expect(result.usage.output).toBeGreaterThan(0);
  });

  it('retries once with the validation error, then accepts the repaired answer', async () => {
    const notes: (string | undefined)[] = [];
    const provider = new MockProvider((request) => {
      notes.push(request.repairNote);
      return request.repairNote ? { answer: 1 } : { answer: 'one' };
    });
    const result = await provider.completeStructured(z.object({ answer: z.number() }), REQUEST);
    expect(result.value).toEqual({ answer: 1 });
    expect(notes[0]).toBeUndefined();
    expect(notes[1]).toContain('answer');
  });

  it('fails with LlmOutputError when the repair also fails', async () => {
    const provider = new MockProvider(() => ({ answer: 'still wrong' }));
    await expect(provider.completeStructured(z.object({ answer: z.number() }), REQUEST)).rejects.toThrow(
      LlmOutputError,
    );
  });

  it('completes plain text', async () => {
    const provider = new MockProvider(() => 'hello');
    await expect(provider.complete(REQUEST)).resolves.toMatchObject({ value: 'hello' });
  });
});

describe('Budget', () => {
  const limits = { tokenBudget: 100, maxSteps: 2, runTimeoutMs: 1_000, costPerMTok: { input: 3, output: 15 } };

  it('adds usage and estimates cost', () => {
    const budget = new Budget(limits, new ManualClock());
    budget.charge({ input: 40, output: 20 });
    expect(budget.totalTokens).toBe(60);
    expect(budget.estimateCost()).toBeCloseTo((40 * 3 + 20 * 15) / 1_000_000);
  });

  it('throws when tokens, steps or run time run out', () => {
    const clock = new ManualClock();
    const budget = new Budget(limits, clock);
    expect(() => budget.charge({ input: 90, output: 20 })).toThrow(BudgetExceededError);

    const steps = new Budget(limits, clock);
    steps.countStep();
    steps.countStep();
    expect(() => steps.countStep()).toThrow(/step limit/);

    const timed = new Budget(limits, clock);
    clock.advance(1_001);
    expect(() => timed.assertWithin()).toThrow(/run timeout/);
  });
});

describe('mapWithLimit and withTimeout', () => {
  it('keeps input order and never runs more than the limit at once', async () => {
    let running = 0;
    let peak = 0;
    const doubled = await mapWithLimit([1, 2, 3, 4, 5], 2, async (value) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return value * 2;
    });
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
    expect(peak).toBe(2);
    await expect(mapWithLimit([], 4, async (value: number) => value)).resolves.toEqual([]);
  });

  it('rejects slow work with TimeoutError and passes fast work through', async () => {
    const slow = new Promise((resolve) => setTimeout(resolve, 50));
    await expect(withTimeout(slow, 5, 'slow call')).rejects.toThrow(TimeoutError);
    await expect(withTimeout(Promise.resolve('ok'), 50, 'fast call')).resolves.toBe('ok');
  });
});

