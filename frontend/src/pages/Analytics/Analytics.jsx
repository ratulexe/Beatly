import React, { Suspense, lazy } from 'react';
import { useOverview } from '../../hooks/useOverview';
import { useTimeInsights } from '../../hooks/useTimeInsights';
import { useGenres } from '../../hooks/useGenres';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Card } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

const TimeDistributionChart = lazy(() =>
  import('../../components/charts/TimeDistributionChart').then((module) => ({
    default: module.TimeDistributionChart,
  }))
);

const GenreChart = lazy(() =>
  import('../../components/charts/GenreChart').then((module) => ({
    default: module.GenreChart,
  }))
);

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useOverview();
  const { data: timeInsights, isLoading: timeLoading, isError: timeError } = useTimeInsights();
  const { data: genres, isLoading: genresLoading, isError: genresError } = useGenres();

  if (overviewLoading || timeLoading || genresLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size={48} /></div>;
  }

  if (overviewError || timeError || genresError) {
    return <ErrorState title="Error loading analytics" message="Please try syncing your tracks first." />;
  }

  const periods = timeInsights?.periods || {};

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Analytics</h1>
          <p className="text-beatly-text-muted font-semibold">Deep dive into your listening habits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Suspense fallback={<div className="h-[360px] rounded-2xl bg-beatly-surface animate-pulse" />}>
            <TimeDistributionChart hourlyData={timeInsights?.hourly} />
          </Suspense>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Suspense fallback={<div className="h-[360px] rounded-2xl bg-beatly-surface animate-pulse" />}>
            <GenreChart genres={genres} />
          </Suspense>
        </motion.div>
      </div>

      <h2 className="text-2xl font-extrabold mt-12 mb-6 border-b border-beatly-border pb-4">Time of Day Preferences</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center text-center">
          <Sunrise size={32} className="text-yellow-400 mb-4" />
          <p className="text-beatly-text-muted font-bold mb-1">Morning</p>
          <p className="text-2xl font-extrabold">{periods.morning?.playCount || 0} plays</p>
        </Card>
        
        <Card className="flex flex-col items-center text-center">
          <Sun size={32} className="text-orange-400 mb-4" />
          <p className="text-beatly-text-muted font-bold mb-1">Afternoon</p>
          <p className="text-2xl font-extrabold">{periods.afternoon?.playCount || 0} plays</p>
        </Card>
        
        <Card className="flex flex-col items-center text-center">
          <Sunset size={32} className="text-red-400 mb-4" />
          <p className="text-beatly-text-muted font-bold mb-1">Evening</p>
          <p className="text-2xl font-extrabold">{periods.evening?.playCount || 0} plays</p>
        </Card>
        
        <Card className="flex flex-col items-center text-center">
          <Moon size={32} className="text-blue-400 mb-4" />
          <p className="text-beatly-text-muted font-bold mb-1">Night</p>
          <p className="text-2xl font-extrabold">{periods.night?.playCount || 0} plays</p>
        </Card>
      </div>

    </div>
  );
}
