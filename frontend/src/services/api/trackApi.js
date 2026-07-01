import { api } from '../apiClient';

export const trackApi = {
  getRecentTracks: async (page = 1, limit = 20) => {
    const response = await api.get('/api/tracks/recent', { params: { page, limit } });
    return response.data; // Note: Our backend returns { success, message, data }
  },

  syncTracks: async () => {
    const response = await api.patch('/api/tracks/sync');
    return response.data;
  },

  getSyncStatus: async () => {
    const response = await api.get('/api/sync/status');
    return response.data || response;
  },

  getNowPlaying: async () => {
    const response = await api.get(`/api/tracks/now-playing?t=${Date.now()}`);
    return response.data;
  }
};
