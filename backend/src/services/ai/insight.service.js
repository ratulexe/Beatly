import { getAIProvider } from './aiFactory.js';
import { systemPrompts, promptBuilder } from './promptBuilder.js';
import logger from '../../config/logger.js';

export const generateInsights = async (analyticsData) => {
  try {
    const provider = getAIProvider();
    const prompt = promptBuilder.buildInsightsPrompt(analyticsData);
    
    // We expect a JSON array of strings
    const insights = await provider.generateJSON(systemPrompts.general, prompt);
    return insights;
  } catch (error) {
    logger.error('[InsightService] Error generating insights:', error);
    throw error;
  }
};
