import { useState, useEffect } from 'react';
import { Users, Search, Loader, Zap } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/apiClient';
import { useProfile } from '../../hooks/useProfile';

const Compare = () => {
  const { profile: currentUser } = useProfile();
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([currentUser?._id]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedUsers.length >= 2) {
      fetchComparison();
    } else {
      setComparisonData([]);
    }
  }, [selectedUsers]);

  const fetchFriends = async () => {
    try {
      const data = await api.get('/api/friends');
      setFriends(data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    }
  };

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const data = await api.post('/api/compare', { userIds: selectedUsers });
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to compare users', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      if (userId === currentUser?._id) return; // Can't remove self for now
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      if (selectedUsers.length >= 4) return; // Max 4 users to compare
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const formatHours = (ms) => Math.round((ms || 0) / 3600000);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Compare Users" 
        subtitle="See how your listening habits stack up against your friends"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Select Users */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="text-beatly-primary" /> Select Friends
            </h3>
            <p className="text-sm text-gray-400 mb-4">Select up to 3 friends to compare with.</p>
            
            <div className="space-y-2">
              {friends.map((friendship) => {
                const friend = friendship.requester._id === currentUser?._id ? friendship.recipient : friendship.requester;
                const isSelected = selectedUsers.includes(friend._id);
                return (
                  <div 
                    key={friend._id}
                    onClick={() => toggleUser(friend._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'bg-beatly-primary/20 border border-beatly-primary/50' : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-beatly-surface overflow-hidden">
                      {friend.profileImage ? (
                        <img loading="lazy" src={friend.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">{friend.displayName?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{friend.displayName}</p>
                    </div>
                    {isSelected && <Zap size={16} className="text-beatly-primary" />}
                  </div>
                );
              })}
              {friends.length === 0 && (
                <div className="text-sm text-gray-400 p-4 text-center">Add friends to compare!</div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content: Comparison Grid */}
        <div className="lg:col-span-3">
          <Card className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full pt-20">
                <Loader className="animate-spin text-beatly-primary" size={48} />
              </div>
            ) : selectedUsers.length < 2 ? (
              <div className="flex flex-col items-center justify-center h-full pt-20 text-gray-400">
                <Search size={48} className="mb-4 opacity-50" />
                <p>Select a friend from the left to start comparing.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-white/10 font-medium text-gray-400">Metric</th>
                      {comparisonData.map(user => (
                        <th key={user._id} className="p-4 border-b border-white/10 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-beatly-primary mb-2">
                              {user.profileImage ? (
                                <img loading="lazy" src={user.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold bg-white/10">{user.displayName?.charAt(0)}</div>
                              )}
                            </div>
                            <span className="font-bold">{user.displayName}</span>
                            <span className="text-xs text-beatly-primary">Lvl {user.level}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-medium">Listening Personality</td>
                      {comparisonData.map(user => (
                        <td key={user._id} className="p-4 border-b border-white/5 text-center font-bold text-yellow-400">
                          {user.listeningPersonality}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-medium">Total Listening Time</td>
                      {comparisonData.map(user => (
                        <td key={user._id} className="p-4 border-b border-white/5 text-center text-xl">
                          {formatHours(user.metrics.totalListeningTimeMs)} <span className="text-sm text-gray-400">hrs</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-medium">Total Songs Played</td>
                      {comparisonData.map(user => (
                        <td key={user._id} className="p-4 border-b border-white/5 text-center text-xl">
                          {user.metrics.totalSongs.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-medium">Current Streak</td>
                      {comparisonData.map(user => (
                        <td key={user._id} className="p-4 border-b border-white/5 text-center text-xl text-orange-500 font-bold">
                          {user.currentStreak} 🔥
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-medium">Top Artist</td>
                      {comparisonData.map(user => (
                        <td key={user._id} className="p-4 border-b border-white/5 text-center">
                          {user.metrics.topArtist ? (
                            <div>
                              <div className="font-bold">{user.metrics.topArtist.name}</div>
                              <div className="text-xs text-gray-400">{formatHours(user.metrics.topArtist.totalMs)} hrs</div>
                            </div>
                          ) : '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Compare;
