import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  withCredentials: true
});

export const invitationApi = {
  getInvitations: async () => {
    const response = await api.get('/invitations');
    return response.data;
  },
  
  sendInvitation: async (receiverId, groupId) => {
    const response = await api.post('/invitations', { receiverId, groupId });
    return response.data;
  },
  
  respondToInvitation: async (invitationId, status) => {
    const response = await api.patch(`/invitations/${invitationId}`, { status });
    return response.data;
  }
};
