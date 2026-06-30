import { api } from '../apiClient';

export const aiApi = {
  getInsights: () => api.get('/api/ai/insights'),
  getRecommendations: () => api.get('/api/ai/recommendations'),
  getPersonality: () => api.get('/api/ai/personality'),
  getPredictions: () => api.get('/api/ai/predictions'),
  getReport: (timeframe) => api.get(`/api/ai/reports/${timeframe}`),
  compareFriend: (friendId) => api.get(`/api/ai/compare/${friendId}`),
  
  // Streaming chat requires native fetch to read the stream
  streamChat: async (message, onToken) => {
    try {
      const baseUrl = api.defaults.baseURL || 'http://127.0.0.1:5000';
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI Chat');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf('\n\n');

          if (chunk.startsWith('data: ')) {
            const dataStr = chunk.replace('data: ', '');
            if (dataStr === '[DONE]') {
              return; // Stream complete
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                onToken(data.content);
              } else if (data.error) {
                console.error('Stream error:', data.error);
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', chunk);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      throw err;
    }
  }
};
