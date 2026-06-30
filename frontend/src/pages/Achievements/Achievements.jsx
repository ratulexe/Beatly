import { useState, useEffect } from 'react';
import { Award, Lock, Loader } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/apiClient';

import { AchievementCard } from '../../components/achievements/AchievementCard';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achData, progData] = await Promise.all([
        api.get('/api/achievements'),
        api.get('/api/achievements/progress')
      ]);
      setAchievements(achData);
      setProgress(progData);
    } catch (error) {
      console.error('Failed to fetch achievements data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 perspective-1000">
      <PageHeader 
        title="Achievements" 
        subtitle="Complete challenges and earn XP to level up!"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-beatly-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {achievements.map((ach) => {
            const userProg = progress.find(p => p.achievement._id === ach._id);
            const isCompleted = userProg?.completed;
            const currentProg = userProg?.progress || 0;
            const threshold = ach.unlockCondition.threshold;

            return (
              <AchievementCard 
                key={ach._id}
                achievement={ach}
                isCompleted={isCompleted}
                currentProg={currentProg}
                threshold={threshold}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achievements;
