import { env } from '../../../config/env.js';
import logger from '../../../config/logger.js';

export class OllamaProvider {
  constructor() {
    this.baseUrl = env.OLLAMA_BASE_URL;
    this.model = env.OLLAMA_MODEL;
  }

  async generateText(systemPrompt, userPrompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: false,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      logger.error('[OllamaProvider] Error generating text:', error);
      throw error;
    }
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          format: 'json',
          stream: false,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.message.content);
    } catch (error) {
      logger.error('[OllamaProvider] Error generating JSON:', error);
      throw error;
    }
  }

  async streamText(systemPrompt, userPrompt, onToken, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          stream: true,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      // Web Streams API mapping since fetch returns a ReadableStream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const line = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 1);
          boundary = buffer.indexOf('\n');

          if (line) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                onToken(data.message.content);
              }
            } catch (e) {
              logger.warn('[OllamaProvider] Failed to parse JSON chunk:', line);
            }
          }
        }
      }
    } catch (error) {
      logger.error('[OllamaProvider] Error streaming text:', error);
      throw error;
    }
  }
}
