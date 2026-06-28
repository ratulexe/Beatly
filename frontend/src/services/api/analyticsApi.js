import api from './axios';

export const analyticsApi = {
  generateAnalytics: () => api.post('/analytics/generate'),
  
  getOverview: () => api.get('/analytics/overview'),
  
  getDailyStats: (days = 7) => api.get('/analytics/daily', { params: { days } }),
  
  getTopArtists: () => api.get('/analytics/top-artists'),
  
  getTopTracks: () => api.get('/analytics/top-tracks'),
  
  getTopAlbums: () => api.get('/analytics/top-albums'),
  
  getGenres: () => api.get('/analytics/genres'),
  
  getTimeInsights: () => api.get('/analytics/time-insights')
};
