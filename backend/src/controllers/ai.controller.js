import { generateInsights } from '../services/ai/insight.service.js';
import { generateRecommendations } from '../services/ai/recommendation.service.js';
import { generatePredictions } from '../services/ai/prediction.service.js';
import { generateSummary } from '../services/ai/summary.service.js';
import { getAIProvider } from '../services/ai/aiFactory.js';
import { promptBuilder, systemPrompts } from '../services/ai/promptBuilder.js';
import { analyticsRepository } from '../services/database/analyticsRepository.js';
import { cacheService } from '../services/cache/cacheService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../config/logger.js';

const getAnalyticsData = async (userId) => {
  const snapshot = await analyticsRepository.getLatestSnapshot(userId, 'overall');
  if (!snapshot) return null;
  // Remove sensitive or unnecessary data to save tokens
  const cleanData = {
    totalListeningTime: snapshot.totalListeningTime,
    playCount: snapshot.playCount,
    topArtists: snapshot.topArtists?.slice(0, 5).map(a => ({ name: a.name, playCount: a.playCount, genres: a.genres })),
    topTracks: snapshot.topTracks?.slice(0, 5).map(t => ({ name: t.name, artist: t.artistName, playCount: t.playCount })),
    topAlbums: snapshot.topAlbums?.slice(0, 5).map(a => ({ name: a.name, artist: a.artistName, playCount: a.playCount })),
    topGenres: snapshot.topGenres?.slice(0, 5),
    timeOfDay: snapshot.timeOfDay
  };
  return cleanData;
};

// Helper to normalize array responses since LLMs sometimes wrap arrays in objects
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const arrays = Object.values(data).filter(val => Array.isArray(val));
    if (arrays.length > 0) return arrays[0];
  }
  return [];
};

export const getInsights = async (req, res) => {
  try {
    const data = await getAnalyticsData(req.user._id);
    if (!data) return res.status(404).json(errorResponse('No analytics data available yet.'));

    const cacheKey = `ai:insights:${req.user._id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    let insights = await generateInsights(data);
    insights = extractArray(insights);
    cacheService.set(cacheKey, insights, 3600);

    return res.status(200).json(successResponse(insights));
  } catch (error) {
    logger.error('[AIController] Error in getInsights:', error);
    return res.status(500).json(errorResponse('Failed to generate insights.'));
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const data = await getAnalyticsData(req.user._id);
    if (!data) return res.status(404).json(errorResponse('No analytics data available yet.'));

    const cacheKey = `ai:recommendations:${req.user._id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    let recommendations = await generateRecommendations(data);
    recommendations = extractArray(recommendations);
    cacheService.set(cacheKey, recommendations, 3600);

    return res.status(200).json(successResponse(recommendations));
  } catch (error) {
    logger.error('[AIController] Error in getRecommendations:', error);
    return res.status(500).json(errorResponse('Failed to generate recommendations.'));
  }
};

export const getPersonality = async (req, res) => {
  try {
    const data = await getAnalyticsData(req.user._id);
    if (!data) return res.status(404).json(errorResponse('No analytics data available yet.'));

    const cacheKey = `ai:personality:${req.user._id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    const provider = getAIProvider();
    const prompt = promptBuilder.buildPersonalityPrompt(data);
    const personality = await provider.generateJSON(systemPrompts.general, prompt);
    
    cacheService.set(cacheKey, personality, 86400); // 24 hours

    return res.status(200).json(successResponse(personality));
  } catch (error) {
    logger.error('[AIController] Error in getPersonality:', error);
    return res.status(500).json(errorResponse('Failed to generate personality.'));
  }
};

export const getPredictions = async (req, res) => {
  try {
    const data = await getAnalyticsData(req.user._id);
    if (!data) return res.status(404).json(errorResponse('No analytics data available yet.'));

    const cacheKey = `ai:predictions:${req.user._id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    let predictions = await generatePredictions(data);
    predictions = extractArray(predictions);
    cacheService.set(cacheKey, predictions, 86400);

    return res.status(200).json(successResponse(predictions));
  } catch (error) {
    logger.error('[AIController] Error in getPredictions:', error);
    return res.status(500).json(errorResponse('Failed to generate predictions.'));
  }
};

export const getReport = async (req, res) => {
  try {
    const { timeframe } = req.params;
    const data = await getAnalyticsData(req.user._id);
    if (!data) return res.status(404).json(errorResponse('No analytics data available yet.'));

    const cacheKey = `ai:report:${timeframe}:${req.user._id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    const report = await generateSummary(data, timeframe);
    cacheService.set(cacheKey, report, 86400);

    return res.status(200).json(successResponse({ markdown: report }));
  } catch (error) {
    logger.error('[AIController] Error in getReport:', error);
    return res.status(500).json(errorResponse('Failed to generate report.'));
  }
};

export const compareFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userData = await getAnalyticsData(req.user._id);
    const friendData = await getAnalyticsData(friendId);
    
    if (!userData || !friendData) {
      return res.status(404).json(errorResponse('Insufficient data to compare.'));
    }

    const cacheKey = `ai:compare:${req.user._id}:${friendId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(successResponse(cached));

    const provider = getAIProvider();
    const prompt = promptBuilder.buildComparePrompt(userData, friendData);
    const comparison = await provider.generateText(systemPrompts.general, prompt);
    
    cacheService.set(cacheKey, comparison, 86400);

    return res.status(200).json(successResponse({ markdown: comparison }));
  } catch (error) {
    logger.error('[AIController] Error in compareFriend:', error);
    return res.status(500).json(errorResponse('Failed to generate comparison.'));
  }
};

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json(errorResponse('Message is required.'));

    const data = await getAnalyticsData(req.user._id);
    
    const userPrompt = `Context (User Listening Data):
${JSON.stringify(data || {}, null, 2)}

User Question:
${message}

Please answer the user's question using their listening data. Be concise and conversational.`;

    const provider = getAIProvider();
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await provider.streamText(systemPrompts.general, userPrompt, (token) => {
      res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    logger.error('[AIController] Error in chat:', error);
    if (!res.headersSent) {
      return res.status(500).json(errorResponse('Failed to chat.'));
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Generation failed.' })}\n\n`);
      res.end();
    }
  }
};
