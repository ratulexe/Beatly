import { env } from '../../config/env.js';
import logger from '../../config/logger.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';

let activeProviderInstance = null;

/**
 * Get the active AI provider based on environment variables
 */
export const getAIProvider = () => {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const providerName = env.AI_PROVIDER || 'ollama';

  switch (providerName.toLowerCase()) {
    case 'ollama':
      activeProviderInstance = new OllamaProvider();
      break;
    case 'openai':
      activeProviderInstance = new OpenAIProvider();
      break;
    case 'gemini':
      activeProviderInstance = new GeminiProvider();
      break;
    case 'anthropic':
      activeProviderInstance = new AnthropicProvider();
      break;
    default:
      logger.warn(`[AIFactory] Unknown AI provider '${providerName}'. Falling back to Ollama.`);
      activeProviderInstance = new OllamaProvider();
  }

  logger.info(`[AIFactory] Initialized AI Provider: ${activeProviderInstance.constructor.name}`);
  return activeProviderInstance;
};
