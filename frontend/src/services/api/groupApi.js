import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  withCredentials: true
});

export const groupApi = {
  getUserGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },
  
  getGroupDetails: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },
  
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  }
};
