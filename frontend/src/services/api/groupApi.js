import { api } from '../apiClient';

export const groupApi = {
  getUserGroups: async () => {
    const response = await api.get('/api/groups');
    return response;
  },
  
  getGroupDetails: async (groupId) => {
    const response = await api.get(`/api/groups/${groupId}`);
    return response;
  },
  
  createGroup: async (groupData) => {
    const response = await api.post('/api/groups', groupData);
    return response;
  },

  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/api/groups/${groupId}/members/${userId}`);
    return response;
  }
};
