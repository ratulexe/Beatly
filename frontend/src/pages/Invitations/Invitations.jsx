import React from 'react';
import { Mail, Inbox, Users } from 'lucide-react';
import FriendRequestCard from '../../components/friends/FriendRequestCard';
import { useFriends } from '../../hooks/useFriends';
import { useInvitations } from '../../hooks/useInvitations';

const Invitations = () => {
  const { requests, loading: loadingRequests, respondToRequest } = useFriends();
  const { invitations, loading: loadingInvites, respondToInvitation } = useInvitations();

  const handleAcceptFriend = (id) => respondToRequest(id, 'accepted');
  const handleDeclineFriend = (id) => respondToRequest(id, 'rejected');
  const handleCancelFriend = (id) => respondToRequest(id, 'rejected'); // or however we cancel, maybe 'cancelled' or delete.

  const handleAcceptGroup = (id) => respondToInvitation(id, 'accepted');
  const handleDeclineGroup = (id) => respondToInvitation(id, 'rejected');

  const incoming = requests?.incoming || [];
  const outgoing = requests?.outgoing || [];
  const groupInvites = invitations || [];

  if (loadingRequests || loadingInvites) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-beatly-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Invitations</h1>
        <p className="text-beatly-text-muted">Manage your pending friend requests and group invitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Friend Requests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="text-beatly-primary" size={20} />
            <h2 className="text-xl font-bold text-white">Incoming Requests <span className="text-sm font-semibold bg-beatly-surface px-2 py-0.5 rounded-full text-beatly-text-muted ml-2">{incoming.length}</span></h2>
          </div>
          
          {incoming.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
              <Inbox size={32} className="text-beatly-text-muted mb-3" />
              <p className="text-beatly-text-muted font-medium">No pending incoming requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incoming.map(req => (
                <FriendRequestCard 
                  key={req._id} 
                  request={req} 
                  type="incoming"
                  onAccept={handleAcceptFriend}
                  onDecline={handleDeclineFriend}
                />
              ))}
            </div>
          )}
        </div>

        {/* Group Invitations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-beatly-primary" size={20} />
            <h2 className="text-xl font-bold text-white">Group Invites <span className="text-sm font-semibold bg-beatly-surface px-2 py-0.5 rounded-full text-beatly-text-muted ml-2">{groupInvites.length}</span></h2>
          </div>
          
          {groupInvites.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
              <Users size={32} className="text-beatly-text-muted mb-3" />
              <p className="text-beatly-text-muted font-medium">No pending group invites.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupInvites.map(inv => (
                <div key={inv._id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-beatly-primary">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-beatly-surface-hover flex items-center justify-center text-white font-bold">
                      {inv.group?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{inv.group?.name || 'Unknown Group'}</h3>
                      <p className="text-beatly-text-muted text-xs">Invited by {inv.sender?.displayName || inv.sender?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAcceptGroup(inv._id)} className="px-3 py-1.5 bg-beatly-primary text-black hover:bg-beatly-primary/90 rounded-xl font-bold text-sm">Accept</button>
                    <button onClick={() => handleDeclineGroup(inv._id)} className="px-3 py-1.5 bg-beatly-surface-hover text-white hover:bg-beatly-surface rounded-xl font-bold text-sm">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Friend Requests */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="text-beatly-text-muted" size={20} />
            <h2 className="text-xl font-bold text-white">Sent Requests <span className="text-sm font-semibold bg-beatly-surface px-2 py-0.5 rounded-full text-beatly-text-muted ml-2">{outgoing.length}</span></h2>
          </div>
          
          {outgoing.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
              <Mail size={32} className="text-beatly-text-muted mb-3" />
              <p className="text-beatly-text-muted font-medium">No pending sent requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoing.map(req => (
                <FriendRequestCard 
                  key={req._id} 
                  request={req} 
                  type="outgoing"
                  onCancel={handleCancelFriend}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invitations;
