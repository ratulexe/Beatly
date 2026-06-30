import { api } from '../apiClient';

export const invitationApi = {
  getInvitations: async () => {
    const response = await api.get('/api/invitations');
    return response;
  },
  
  sendInvitation: async (receiverId, groupId) => {
    const response = await api.post('/api/invitations', { receiverId, groupId });
    return response;
  },
  
  respondToInvitation: async (invitationId, status) => {
    const response = await api.patch(`/api/invitations/${invitationId}`, { status });
    return response;
  }
};
