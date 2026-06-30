import React, { useEffect, useState } from 'react';
import { Target, Activity, ShieldAlert, Zap, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { coachApi } from '../../services/api/coachApi';
import ListeningCalendar from './components/ListeningCalendar';
import ChallengeCard from './components/ChallengeCard';
import HeroSection from './components/HeroSection';
import QuickStats from './components/QuickStats';
import GoalCard from './components/GoalCard';
import HabitCard from './components/HabitCard';
import AIInsightCard from './components/AIInsightCard';
import AIPersonalityCard from './components/AIPersonalityCard';
import RewardsSection from './components/RewardsSection';

const CoachDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [res, calRes, chalRes] = await Promise.all([
          coachApi.getDashboard(),
          coachApi.getCalendar(),
          coachApi.getChallenges()
        ]);
        setDashboard(res.data);
        setCalendarData(calRes.data);
        setChallenges(chalRes.data);
      } catch (error) {
        console.error('Failed to load coach dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
        <div className="h-[200px] bg-white/5 rounded-[2.5rem]" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-white/5 rounded-3xl" />
          <div className="h-24 bg-white/5 rounded-3xl" />
          <div className="h-24 bg-white/5 rounded-3xl" />
          <div className="h-24 bg-white/5 rounded-3xl" />
        </div>
        <div className="h-[300px] bg-white/5 rounded-[2.5rem]" />
      </div>
    );
  }

  const { goals, habits, aiSuggestion } = dashboard || {};

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 max-w-7xl mx-auto">
      
      {/* 1. Hero Section */}
      <HeroSection dashboard={dashboard} />

      {/* 2. Quick Stats Row */}
      <QuickStats dashboard={dashboard} />

      {/* 3. Heatmap Row */}
      <ListeningCalendar data={calendarData} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Main Focus Area) - span 7 */}
        <div className="lg:col-span-7 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Target className="text-beatly-primary" /> Active Goals
            </h2>
            <div className="space-y-4">
              {goals?.map((goal, i) => (
                <GoalCard key={goal._id} goal={goal} index={i} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <ShieldAlert className="text-purple-400" /> Community Challenges
            </h2>
            <div className={`grid grid-cols-1 ${challenges?.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
              {challenges?.map((chal, i) => (
                <ChallengeCard key={chal._id} challenge={chal} index={i} onJoin={(id) => toast.success(`Joined Challenge: ${id}`)} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (AI & Progression) - span 5 */}
        <div className="lg:col-span-5 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Zap className="text-yellow-400" /> Beatly AI Insights
            </h2>
            <AIInsightCard suggestion={aiSuggestion} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Award className="text-yellow-400" /> Rewards & Progression
            </h2>
            <RewardsSection />
          </section>
        </div>

      </div>

      {/* Second Grid Layout (Habits & Personality) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - span 7 */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <Activity className="text-blue-400" /> Detected Habits
            </h2>
            <div className="space-y-4">
              {habits?.length > 0 ? habits.map((h, i) => (
                <HabitCard key={h._id || i} habit={h} index={i} />
              )) : (
                <div className="text-gray-500 italic p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                  Listening more to unlock habit detection!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - span 5 */}
        <div className="lg:col-span-5 space-y-8">
          {habits?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Activity className="text-purple-400" /> AI Personality Profile
              </h2>
              <AIPersonalityCard habit={habits[0]} />
            </section>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default CoachDashboard;
