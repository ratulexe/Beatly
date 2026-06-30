import { getAIProvider } from './aiFactory.js';
import { systemPrompts, promptBuilder } from './promptBuilder.js';
import logger from '../../config/logger.js';

export const generateSummary = async (analyticsData, timeframe) => {
  try {
    const provider = getAIProvider();
    const prompt = promptBuilder.buildSummaryPrompt(analyticsData, timeframe);
    
    // Expects markdown text
    const summary = await provider.generateText(systemPrompts.general, prompt);
    return summary;
  } catch (error) {
    logger.error('[SummaryService] Error generating summary:', error);
    throw error;
  }
};
