import { api } from '../apiClient';

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },
  
  syncProfile: async () => {
    const response = await api.patch('/api/user/sync');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
};
