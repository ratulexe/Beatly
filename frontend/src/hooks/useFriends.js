import { useState, useEffect } from 'react';
import { friendApi } from '../services/api/friendApi';

export const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendApi.getFriends(),
        friendApi.getRequests()
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch friends data');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await friendApi.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f._id !== friendId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to remove friend');
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      await friendApi.respondToRequest(requestId, status);
      await fetchData(); // refresh data
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to respond to request');
    }
  };

  return { friends, requests, loading, error, removeFriend, respondToRequest, refetch: fetchData };
};
