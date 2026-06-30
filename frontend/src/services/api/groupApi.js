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
  }
};
