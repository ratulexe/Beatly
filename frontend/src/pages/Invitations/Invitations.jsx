import React, { useState } from 'react';
import { Mail, Inbox } from 'lucide-react';
import FriendRequestCard from '../../components/friends/FriendRequestCard';

// Mock Data
const MOCK_INCOMING = [
  { id: '1', name: 'Frank Castle' },
  { id: '2', name: 'Grace Hopper' },
];

const MOCK_OUTGOING = [
  { id: '3', name: 'Henry Ford' },
];

const Invitations = () => {
  const [incoming, setIncoming] = useState(MOCK_INCOMING);
  const [outgoing, setOutgoing] = useState(MOCK_OUTGOING);

  const handleAccept = (id) => {
    setIncoming(prev => prev.filter(req => req.id !== id));
    console.log('Accepted request', id);
  };

  const handleDecline = (id) => {
    setIncoming(prev => prev.filter(req => req.id !== id));
    console.log('Declined request', id);
  };

  const handleCancel = (id) => {
    setOutgoing(prev => prev.filter(req => req.id !== id));
    console.log('Canceled request', id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Invitations</h1>
        <p className="text-beatly-text-muted">Manage your pending friend requests and group invitations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Requests */}
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
                  key={req.id} 
                  request={req} 
                  type="incoming"
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="space-y-4">
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
            <div className="space-y-3">
              {outgoing.map(req => (
                <FriendRequestCard 
                  key={req.id} 
                  request={req} 
                  type="outgoing"
                  onCancel={handleCancel}
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
