import { z } from 'zod';
import { ConfigError } from '../errors/AppError';

const DEFAULTS = {
  maxAttempts: 3,
  maxSteps: 25,
  callTimeoutMs: 60_000,
  runTimeoutMs: 600_000,
  tokenBudget: 400_000,
  concurrency: 4,
  riskThreshold: 40,
  maxHoursPerWeek: 4,
  /** Per-call delay of the offline provider, so a run can be watched as it happens. */
  mockLatencyMs: 700,
} as const;

/** `.env` files give empty strings for unset keys; treat those as "not set". */
const blankToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const text = z.preprocess(blankToUndefined, z.string().optional());
const count = (fallback: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(fallback));
const amount = (fallback: number) =>
  z.preprocess(blankToUndefined, z.coerce.number().nonnegative().default(fallback));
const choice = <T extends readonly [string, ...string[]]>(options: T, fallback: T[number]) =>
  z.preprocess(blankToUndefined, z.enum(options).default(fallback));

const EnvSchema = z.object({
  LLM_PROVIDER: choice(['anthropic', 'openai-compatible', 'mock'] as const, 'mock'),
  ANTHROPIC_API_KEY: text,
  LLM_MODEL_REASONING: text,
  LLM_MODEL_FAST: text,
  OPENAI_COMPAT_BASE_URL: text,
  OPENAI_COMPAT_API_KEY: text,
  OPENAI_COMPAT_MODEL: text,
  RUN_MAX_ATTEMPTS: count(DEFAULTS.maxAttempts),
  RUN_MAX_STEPS: count(DEFAULTS.maxSteps),
  LLM_CALL_TIMEOUT_MS: count(DEFAULTS.callTimeoutMs),
  RUN_TIMEOUT_MS: count(DEFAULTS.runTimeoutMs),
  RUN_TOKEN_BUDGET: count(DEFAULTS.tokenBudget),
  LLM_CONCURRENCY: count(DEFAULTS.concurrency),
  LLM_CACHE: choice(['on', 'off'] as const, 'on'),
  LLM_COST_INPUT_PER_MTOK: amount(0),
  LLM_COST_OUTPUT_PER_MTOK: amount(0),
  MOCK_LATENCY_MS: amount(DEFAULTS.mockLatencyMs),
  RISK_THRESHOLD: amount(DEFAULTS.riskThreshold),
  PLAN_MAX_HOURS_PER_WEEK: amount(DEFAULTS.maxHoursPerWeek),
  DELIVERY_MODE: choice(['sandbox', 'redirect', 'live'] as const, 'sandbox'),
  DEMO_RECIPIENT: text,
  DATABASE_URL: text,
  DEMO_PASSWORD: z.preprocess(blankToUndefined, z.string().min(8).default('thuso-demo-2026')),
  ADMIN_PASSWORD: z.preprocess(blankToUndefined, z.string().min(12).optional()),
});
type Env = z.infer<typeof EnvSchema>;

/** Keys each real provider cannot run without. */
const REQUIRED_BY_PROVIDER: Record<Env['LLM_PROVIDER'], readonly (keyof Env)[]> = {
  mock: [],
  anthropic: ['ANTHROPIC_API_KEY', 'LLM_MODEL_REASONING', 'LLM_MODEL_FAST'],
  'openai-compatible': ['OPENAI_COMPAT_BASE_URL', 'OPENAI_COMPAT_API_KEY', 'OPENAI_COMPAT_MODEL'],
};

export interface AppConfig {
  llm: {
    provider: Env['LLM_PROVIDER'];
    anthropicApiKey?: string;
    modelReasoning?: string;
    modelFast?: string;
    openAiCompat: { baseUrl?: string; apiKey?: string; model?: string };
    callTimeoutMs: number;
    concurrency: number;
    isCacheOn: boolean;
    costPerMTok: { input: number; output: number };
    mockLatencyMs: number;
  };
  run: { maxAttempts: number; maxSteps: number; timeoutMs: number; tokenBudget: number };
  rules: { riskThreshold: number; maxHoursPerWeek: number };
  delivery: { mode: Env['DELIVERY_MODE']; demoRecipient?: string };
  /** No DATABASE_URL → an in-process Postgres, seeded on first use (tests and offline demos). */
  school: { databaseUrl?: string; demoPassword: string; adminPassword?: string };
}

function toConfig(env: Env): AppConfig {
  return {
    llm: {
      provider: env.LLM_PROVIDER,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
      modelReasoning: env.LLM_MODEL_REASONING,
      modelFast: env.LLM_MODEL_FAST,
      openAiCompat: {
        baseUrl: env.OPENAI_COMPAT_BASE_URL,
        apiKey: env.OPENAI_COMPAT_API_KEY,
        model: env.OPENAI_COMPAT_MODEL,
      },
      callTimeoutMs: env.LLM_CALL_TIMEOUT_MS,
      concurrency: env.LLM_CONCURRENCY,
      isCacheOn: env.LLM_CACHE === 'on',
      costPerMTok: { input: env.LLM_COST_INPUT_PER_MTOK, output: env.LLM_COST_OUTPUT_PER_MTOK },
      mockLatencyMs: env.MOCK_LATENCY_MS,
    },
    run: {
      maxAttempts: env.RUN_MAX_ATTEMPTS,
      maxSteps: env.RUN_MAX_STEPS,
      timeoutMs: env.RUN_TIMEOUT_MS,
      tokenBudget: env.RUN_TOKEN_BUDGET,
    },
    rules: { riskThreshold: env.RISK_THRESHOLD, maxHoursPerWeek: env.PLAN_MAX_HOURS_PER_WEEK },
    delivery: { mode: env.DELIVERY_MODE, demoRecipient: env.DEMO_RECIPIENT },
    school: {
      databaseUrl: env.DATABASE_URL,
      demoPassword: env.DEMO_PASSWORD,
      adminPassword: env.ADMIN_PASSWORD,
    },
  };
}

/**
 * Validates the environment once at startup and fails fast with a clear message.
 * Error text names the keys only — never their values.
 */
export function loadConfig(source: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new ConfigError(`Invalid environment values: ${keys}. See .env.example.`);
  }
  const missing = REQUIRED_BY_PROVIDER[parsed.data.LLM_PROVIDER].filter((key) => !parsed.data[key]);
  if (missing.length > 0) {
    throw new ConfigError(
      `LLM_PROVIDER=${parsed.data.LLM_PROVIDER} needs: ${missing.join(', ')}. See .env.example.`,
    );
  }
  return toConfig(parsed.data);
}
