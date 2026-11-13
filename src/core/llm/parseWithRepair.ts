import type { z } from 'zod';
import { LlmOutputError } from '../errors/AppError';
import type { LlmResult, TokenUsage } from './LlmProvider';

export interface RawCompletion {
  raw: unknown;
  usage: TokenUsage;
}

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}

/**
 * Model output is untrusted: validate it, and on failure ask once more with the
 * validation error attached (CLAUDE.md §7.2). A second failure fails the step.
 */
export async function parseWithRepair<T>(
  schema: z.ZodType<T>,
  call: (repairNote?: string) => Promise<RawCompletion>,
): Promise<LlmResult<T>> {
  const first = await call();
  const parsed = schema.safeParse(first.raw);
  if (parsed.success) {
    return { value: parsed.data, usage: first.usage };
  }

  const second = await call(describeIssues(parsed.error));
  const reparsed = schema.safeParse(second.raw);
  if (!reparsed.success) {
    throw new LlmOutputError(
      `Model output failed validation twice: ${describeIssues(reparsed.error)}`,
    );
  }
  return {
    value: reparsed.data,
    usage: {
      input: first.usage.input + second.usage.input,
      output: first.usage.output + second.usage.output,
    },
  };
}
