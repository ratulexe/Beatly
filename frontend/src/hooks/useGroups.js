import { useState, useEffect } from 'react';
import { groupApi } from '../services/api/groupApi';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getUserGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      const newGroup = await groupApi.createGroup(groupData);
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create group');
    }
  };

  return { groups, loading, error, createGroup, refetch: fetchGroups };
};
