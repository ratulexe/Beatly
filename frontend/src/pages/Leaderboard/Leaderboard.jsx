import { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/apiClient';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [type, setType] = useState('allTime'); // daily, weekly, monthly, allTime
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/leaderboards/global?type=${type}`);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily', icon: <Clock size={16} /> },
    { id: 'weekly', label: 'Weekly', icon: <Calendar size={16} /> },
    { id: 'monthly', label: 'Monthly', icon: <Calendar size={16} /> },
    { id: 'allTime', label: 'All Time', icon: <Trophy size={16} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Global Leaderboard" 
        subtitle="See how you stack up against the Beatly community"
      />

      {/* Tabs */}
      <div className="flex bg-beatly-surface-hover rounded-xl p-1 w-full max-w-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              type === tab.id 
                ? 'bg-beatly-primary text-black shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beatly-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard?.rankings?.length > 0 ? (
              leaderboard.rankings.map((entry, index) => (
                <div key={entry.user?._id || index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    entry.rank === 1 ? 'bg-yellow-500 text-black' :
                    entry.rank === 2 ? 'bg-gray-300 text-black' :
                    entry.rank === 3 ? 'bg-amber-700 text-black' :
                    'bg-beatly-surface text-white'
                  }`}>
                    {entry.rank}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-beatly-surface border-2 border-beatly-primary/30 flex items-center justify-center overflow-hidden">
                    {entry.user?.profileImage ? (
                      <img loading="lazy" src={entry.user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold uppercase">{entry.user?.displayName?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{entry.user?.displayName || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-400">Score: {entry.score.toLocaleString()} • Streak: {entry.streak} days</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-beatly-primary">{Math.round(entry.listeningTime / 3600000)}h</p>
                    <p className="text-xs text-gray-400">{entry.songs} songs</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                No leaderboard data available for this period yet.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leaderboard;
