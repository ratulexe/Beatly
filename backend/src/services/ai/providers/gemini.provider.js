import logger from '../../../config/logger.js';

export class GeminiProvider {
  constructor() {
    logger.warn('[GeminiProvider] Initialized but not fully implemented.');
  }

  async generateText(systemPrompt, userPrompt, options = {}) {
    throw new Error('Gemini generateText not implemented');
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    throw new Error('Gemini generateJSON not implemented');
  }

  async streamText(systemPrompt, userPrompt, onToken, options = {}) {
    throw new Error('Gemini streamText not implemented');
  }
}
