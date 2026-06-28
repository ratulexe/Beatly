import React from 'react';
import { useOverview } from '../../hooks/useOverview';
import { useTopArtists } from '../../hooks/useTopArtists';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Clock, Disc, Users, Music, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: overview, isLoading, isError, refetch } = useOverview();
  const { data: topArtists } = useTopArtists();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={48} />
      </div>
    );
  }

  if (isError || !overview?.listening) {
    return (
      <ErrorState 
        title="Failed to load dashboard" 
        message="Could not load your analytics. Please try syncing your tracks first." 
        onRetry={refetch} 
      />
    );
  }

  const formatHours = (ms) => (ms / (1000 * 60 * 60)).toFixed(1);
  const { listening } = overview;
  const favoriteArtist = topArtists?.[0];

  const statCards = [
    { title: 'Total Listening Time', value: `${formatHours(listening.totalMs)}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Songs Played', value: listening.totalSongs.toLocaleString(), icon: Music, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Unique Artists', value: listening.uniqueArtists.toLocaleString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Unique Albums', value: listening.uniqueAlbums.toLocaleString(), icon: Disc, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-beatly-text-muted font-semibold">{stat.title}</p>
                  <h3 className="text-2xl font-extrabold">{stat.value}</h3>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Favorite Artist Highlight */}
        {favoriteArtist && (
          <Card className="col-span-1 lg:col-span-1 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-6 self-start w-full text-left border-b border-beatly-border pb-4">Top Artist</h3>
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-beatly-primary blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <img 
                src={favoriteArtist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(favoriteArtist.name)}&background=1ED760&color=000&size=256`} 
                alt={favoriteArtist.name} 
                className="w-40 h-40 object-cover rounded-full border-4 border-beatly-surface shadow-2xl relative z-10"
              />
            </div>
            <h2 className="text-2xl font-extrabold mb-2">{favoriteArtist.name}</h2>
            <div className="flex gap-4 text-sm text-beatly-text-muted font-semibold">
              <span>{favoriteArtist.playCount} plays</span>
              <span>•</span>
              <span>{formatHours(favoriteArtist.totalMs)} hrs</span>
            </div>
          </Card>
        )}

        {/* Future Chart Placeholder */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col justify-center items-center min-h-[300px]">
          <BarChart2 size={48} className="text-beatly-border mb-4" />
          <p className="text-beatly-text-muted font-semibold">Activity Chart Comming in Analytics Tab</p>
        </Card>
      </div>
    </div>
  );
}
