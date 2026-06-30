import { api } from '../apiClient';

export const analyticsApi = {
  generateAnalytics: () => api.post('/api/analytics/generate'),
  
  getOverview: () => api.get('/api/analytics/overview'),
  
  getDailyStats: (days = 7) => api.get('/api/analytics/daily', { params: { days } }),
  
  getTopArtists: () => api.get('/api/analytics/top-artists'),
  
  getTopTracks: () => api.get('/api/analytics/top-tracks'),
  
  getTopAlbums: () => api.get('/api/analytics/top-albums'),
  
  getGenres: () => api.get('/api/analytics/genres'),
  
  getTimeInsights: () => api.get('/api/analytics/time-insights')
};
