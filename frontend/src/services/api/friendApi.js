import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  withCredentials: true
});

export const friendApi = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },
  
  getRequests: async () => {
    const response = await api.get('/friends/requests');
    return response.data;
  },
  
  sendRequest: async (receiverId) => {
    const response = await api.post('/friends/request', { receiverId });
    return response.data;
  },
  
  respondToRequest: async (requestId, status) => {
    const response = await api.patch(`/friends/request/${requestId}`, { status });
    return response.data;
  },
  
  removeFriend: async (friendId) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  }
};
