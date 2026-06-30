import logger from '../../../config/logger.js';

export class OpenAIProvider {
  constructor() {
    logger.warn('[OpenAIProvider] Initialized but not fully implemented.');
  }

  async generateText(systemPrompt, userPrompt, options = {}) {
    throw new Error('OpenAI generateText not implemented');
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    throw new Error('OpenAI generateJSON not implemented');
  }

  async streamText(systemPrompt, userPrompt, onToken, options = {}) {
    throw new Error('OpenAI streamText not implemented');
  }
}
