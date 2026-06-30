import { getAIProvider } from './aiFactory.js';
import { systemPrompts, promptBuilder } from './promptBuilder.js';
import logger from '../../config/logger.js';

export const generateRecommendations = async (analyticsData) => {
  try {
    const provider = getAIProvider();
    const prompt = promptBuilder.buildRecommendationsPrompt(analyticsData);
    
    // Expects JSON array of objects
    const recommendations = await provider.generateJSON(systemPrompts.general, prompt);
    return recommendations;
  } catch (error) {
    logger.error('[RecommendationService] Error generating recommendations:', error);
    throw error;
  }
};
