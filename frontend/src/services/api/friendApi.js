import { api } from '../apiClient';

export const friendApi = {
  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response;
  },
  
  getRequests: async () => {
    const response = await api.get('/api/friends/requests');
    return response;
  },
  
  sendRequest: async (receiverId) => {
    const response = await api.post('/api/friends/request', { receiverId });
    return response;
  },
  
  respondToRequest: async (requestId, status) => {
    const response = await api.patch(`/api/friends/request/${requestId}`, { status });
    return response;
  },
  
  removeFriend: async (friendId) => {
    const response = await api.delete(`/api/friends/${friendId}`);
    return response;
  }
};
