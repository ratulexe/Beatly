import { Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { api } from '../../services/apiClient';
import { ErrorState } from '../../components/ui/ErrorState';

import { AchievementCard } from '../../components/achievements/AchievementCard';

const Achievements = () => {
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const [achievements, progress] = await Promise.all([
        api.get('/api/achievements'),
        api.get('/api/achievements/progress')
      ]);
      return { achievements, progress };
    },
    staleTime: 10 * 60 * 1000,
    retry: 1
  });

  const achievements = data?.achievements || [];
  const progress = data?.progress || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 perspective-1000">
      <PageHeader 
        title="Achievements" 
        subtitle="Complete challenges and earn XP to level up!"
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-beatly-primary" size={48} />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load achievements"
          message="Beatly could not load your achievements right now."
          onRetry={refetch}
        />
      ) : achievements.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-beatly-surface p-10 text-center text-gray-400">
          Achievements will appear after the backend seeds achievement definitions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {achievements.map((ach) => {
            const userProg = progress.find(p => (p.achievement?._id || p.achievement) === ach._id);
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
