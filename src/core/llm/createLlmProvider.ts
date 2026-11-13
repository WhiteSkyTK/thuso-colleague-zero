import type { AppConfig } from '../config/env';
import { ConfigError } from '../errors/AppError';
import type { LlmProvider } from './LlmProvider';
import { demoResponder } from './mock/demoResponder';
import { MockProvider } from './MockProvider';

type ProviderName = AppConfig['llm']['provider'];
type ProviderFactory = (config: AppConfig) => LlmProvider;

const notBuiltYet = (name: ProviderName): ProviderFactory => {
  return () => {
    throw new ConfigError(`LLM_PROVIDER=${name} is not available yet; use LLM_PROVIDER=mock.`);
  };
};

/** Strategy lookup: a new provider is one more entry here. */
const FACTORIES: Record<ProviderName, ProviderFactory> = {
  mock: (config) => new MockProvider(demoResponder, config.llm.mockLatencyMs),
  anthropic: notBuiltYet('anthropic'),
  'openai-compatible': notBuiltYet('openai-compatible'),
};

export function createLlmProvider(config: AppConfig): LlmProvider {
  return FACTORIES[config.llm.provider](config);
}
