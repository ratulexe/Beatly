import { useState, useEffect } from 'react';
import { invitationApi } from '../services/api/invitationApi';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await invitationApi.getInvitations();
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId, status) => {
    try {
      await invitationApi.respondToInvitation(invitationId, status);
      await fetchInvitations(); // Refresh list after response
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to respond to invitation');
    }
  };

  return { invitations, loading, error, respondToInvitation, refetch: fetchInvitations };
};
