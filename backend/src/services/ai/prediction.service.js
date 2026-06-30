import { getAIProvider } from './aiFactory.js';
import { systemPrompts, promptBuilder } from './promptBuilder.js';
import logger from '../../config/logger.js';

export const generatePredictions = async (analyticsData) => {
  try {
    const provider = getAIProvider();
    const prompt = promptBuilder.buildPredictionPrompt(analyticsData);
    
    // Expects JSON array of strings
    const predictions = await provider.generateJSON(systemPrompts.general, prompt);
    return predictions;
  } catch (error) {
    logger.error('[PredictionService] Error generating predictions:', error);
    throw error;
  }
};
