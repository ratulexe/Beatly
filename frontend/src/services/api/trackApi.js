import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  withCredentials: true 
});

export const trackApi = {
  getRecentTracks: async (page = 1, limit = 20) => {
    const response = await api.get('/tracks/recent', { params: { page, limit } });
    return response.data; // Note: Our backend returns { success, message, data }
  },

  syncTracks: async () => {
    const response = await api.patch('/tracks/sync');
    return response.data;
  }
};
