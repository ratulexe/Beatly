import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Loader } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/apiClient';
import { formatDistanceToNow } from 'date-fns';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/activity?scope=global&limit=50');
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivityContent = (activity) => {
    const actorName = activity.actor?.displayName || 'Someone';
    
    switch (activity.type) {
      case 'ACHIEVEMENT_UNLOCKED':
        return (
          <span>
            <span className="font-bold">{actorName}</span> unlocked the <span className="font-bold text-beatly-primary">{activity.metadata?.title}</span> achievement! {activity.metadata?.icon}
          </span>
        );
      case 'LEVEL_UP':
        return (
          <span>
            <span className="font-bold">{actorName}</span> reached <span className="font-bold text-yellow-400">Level {activity.metadata?.newLevel}</span>! 🎉
          </span>
        );
      case 'RANK_UP':
        return (
          <span>
            <span className="font-bold">{actorName}</span> {activity.metadata?.message} 🏆
          </span>
        );
      default:
        return <span><span className="font-bold">{actorName}</span> completed an activity.</span>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="Social Feed" 
        subtitle="See what your friends and the community are up to"
      />

      <Card>
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader className="animate-spin text-beatly-primary" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            {activities.length > 0 ? (
              activities.map(activity => (
                <div key={activity._id} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
                    {activity.actor?.profileImage ? (
                      <img loading="lazy" src={activity.actor.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-beatly-surface flex items-center justify-center font-bold">
                        {activity.actor?.displayName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white/5 p-4 rounded-xl rounded-tl-none relative">
                    {/* Speech bubble tail */}
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-0 border-r-[12px] border-b-[12px] border-transparent border-r-white/5"></div>
                    
                    <p className="text-lg">{renderActivityContent(activity)}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <ActivityIcon size={12} />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                No recent activity to display.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Activity;
