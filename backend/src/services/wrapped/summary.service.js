import { getAIProvider } from '../ai/aiFactory.js';
import logger from '../../config/logger.js';

export const generateAIInsights = async (stats) => {
  try {
    const aiProvider = getAIProvider();
    
    const systemPrompt = `You are a music analytics AI assistant like Spotify Wrapped.
You will be provided with a user's listening statistics.
You must output a JSON object with three keys:
- "personality": A short, catchy title describing their listening personality (e.g. "The Night Owl", "Mainstream Explorer").
- "summary": A brief, uplifting 2-3 sentence summary of their listening habits.
- "roast": A gentle, humorous, 1-sentence roast about their taste.
Ensure the response is valid JSON matching this structure.`;

    const userPrompt = `Here are the stats:\n${JSON.stringify(stats, null, 2)}`;
    
    const insights = await aiProvider.generateJSON(systemPrompt, userPrompt);
    
    return {
      personality: insights?.personality || 'The Eclectic Listener',
      summary: insights?.summary || 'You listened to a lot of great music this period!',
      roast: insights?.roast || 'Your music taste is too chaotic to roast.'
    };
  } catch (error) {
    logger.error('[SummaryService] Failed to generate AI insights:', error);
    return {
      personality: 'The Eclectic Listener',
      summary: 'You listened to a lot of great music this period!',
      roast: 'Your music taste is too chaotic to roast.'
    };
  }
};
