import type { AppConfig } from '../config/env';
import { ConfigError } from '../errors/AppError';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import type { LlmProvider } from './LlmProvider';
import { demoResponder } from './mock/demoResponder';
import { MockProvider } from './MockProvider';
import { OpenAICompatibleProvider } from './OpenAICompatibleProvider';

type ProviderName = AppConfig['llm']['provider'];
type ProviderFactory = (config: AppConfig) => LlmProvider;

function openAiCompatible(config: AppConfig): LlmProvider | undefined {
  const { baseUrl, apiKey, model } = config.llm.openAiCompat;
  if (!baseUrl || !apiKey || !model) {
    return undefined;
  }
  return new OpenAICompatibleProvider({
    baseUrl,
    apiKey,
    model,
    timeoutMs: config.llm.callTimeoutMs,
  });
}

/** Strategy lookup: a new provider is one more entry here. */
const FACTORIES: Record<ProviderName, ProviderFactory> = {
  mock: (config) => new MockProvider(demoResponder, config.llm.mockLatencyMs),
  anthropic: (config) => {
    const { anthropicApiKey, modelReasoning, modelFast, callTimeoutMs } = config.llm;
    if (!anthropicApiKey || !modelReasoning || !modelFast) {
      throw new ConfigError(
        'LLM_PROVIDER=anthropic needs ANTHROPIC_API_KEY, LLM_MODEL_REASONING and LLM_MODEL_FAST.',
      );
    }
    return new AnthropicProvider({
      apiKey: anthropicApiKey,
      models: { reasoning: modelReasoning, fast: modelFast },
      timeoutMs: callTimeoutMs,
    });
  },
  'openai-compatible': (config) => {
    const provider = openAiCompatible(config);
    if (!provider) {
      throw new ConfigError(
        'LLM_PROVIDER=openai-compatible needs OPENAI_COMPAT_BASE_URL, OPENAI_COMPAT_API_KEY and OPENAI_COMPAT_MODEL.',
      );
    }
    return provider;
  },
};

/** The chosen provider; with Claude, an OpenAI-compatible endpoint (if set) is the fallback. */
export function createLlmProvider(config: AppConfig): LlmProvider {
  const primary = FACTORIES[config.llm.provider](config);
  const fallback = config.llm.provider === 'anthropic' ? openAiCompatible(config) : undefined;
  return fallback ? new FallbackProvider([primary, fallback]) : primary;
}
