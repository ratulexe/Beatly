import logger from '../../../config/logger.js';

export class AnthropicProvider {
  constructor() {
    logger.warn('[AnthropicProvider] Initialized but not fully implemented.');
  }

  async generateText(systemPrompt, userPrompt, options = {}) {
    throw new Error('Anthropic generateText not implemented');
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    throw new Error('Anthropic generateJSON not implemented');
  }

  async streamText(systemPrompt, userPrompt, onToken, options = {}) {
    throw new Error('Anthropic streamText not implemented');
  }
}
