export const systemPrompts = {
  general: 'You are Beatly AI, a highly intelligent music analytics assistant. You analyze user listening habits based strictly on the provided JSON data. Do not fabricate any statistics. Note that "durationMs" refers to the length of a track in milliseconds, NOT the number of plays or streams. Be concise, engaging, and friendly.',
};

export const promptBuilder = {
  buildInsightsPrompt: (analyticsData) => {
    return `Analyze the following listening data and generate 3 personalized insights.
Format the output as a JSON array of strings.
Example: ["You listen mostly between 10 PM and 1 AM.", "Your favorite genre is Indie Rock."]

Data:
${JSON.stringify(analyticsData, null, 2)}`;
  },

  buildRecommendationsPrompt: (analyticsData) => {
    return `Based on the following listening habits, generate 3 artist or genre recommendations. Include a brief reason for each.
Format the output as a JSON array of objects: [{ "recommendation": "...", "reason": "..." }]

Data:
${JSON.stringify(analyticsData, null, 2)}`;
  },

  buildPersonalityPrompt: (analyticsData) => {
    return `Analyze the listening habits and determine a "Listening Personality" for the user (e.g., Night Owl, Genre Explorer, Artist Loyalist).
Format the output as a JSON object: 
{
  "name": "Personality Name",
  "description": "Short description",
  "strengths": ["strength 1", "strength 2"],
  "facts": ["fact 1"],
  "challenges": ["challenge 1"]
}

Data:
${JSON.stringify(analyticsData, null, 2)}`;
  },

  buildPredictionPrompt: (analyticsData) => {
    return `Predict future listening trends for this user based on their data.
Format output as a JSON array of strings. Label them as estimates.

Data:
${JSON.stringify(analyticsData, null, 2)}`;
  },

  buildSummaryPrompt: (analyticsData, timeframe) => {
    return `Create a ${timeframe} report summarizing this listening history. 
Highlight the biggest changes, top artists, and fun statistics.
Format as Markdown.

Data:
${JSON.stringify(analyticsData, null, 2)}`;
  },

  buildComparePrompt: (userAData, userBData) => {
    return `Compare the listening habits of User A and User B. Focus on differences in genres, artists, and listening schedule.
Format as a brief Markdown summary highlighting the contrast.

User A Data:
${JSON.stringify(userAData, null, 2)}

User B Data:
${JSON.stringify(userBData, null, 2)}`;
  }
};
