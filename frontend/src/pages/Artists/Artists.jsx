import React from 'react';
import { useTopArtists } from '../../hooks/useTopArtists';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Card } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function Artists() {
  const { data: artists, isLoading, isError } = useTopArtists();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size={48} /></div>;
  }

  if (isError) {
    return <ErrorState title="Error loading artists" />;
  }

  return (
    <div className="pb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-400/10 text-purple-400 rounded-2xl flex items-center justify-center">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Top Artists</h1>
          <p className="text-beatly-text-muted font-semibold">Your most played artists of all time</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {artists?.map((artist, i) => (
          <motion.div
            key={artist.artistId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex flex-col items-center text-center group cursor-pointer hover:bg-beatly-surface-hover transition-colors h-full">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-beatly-primary blur-2xl opacity-0 group-hover:opacity-30 transition-opacity rounded-full"></div>
                {artist.image ? (
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-32 h-32 object-cover rounded-full shadow-lg relative z-10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full shadow-lg relative z-10 bg-beatly-primary/20 border border-beatly-primary flex items-center justify-center text-beatly-primary text-4xl font-bold uppercase">
                    {artist.name ? artist.name.charAt(0) : '?'}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg leading-tight mb-2 truncate w-full">{artist.name}</h3>
              <div className="mt-auto">
                <span className="text-xs font-bold text-beatly-text-muted bg-beatly-surface px-3 py-1 rounded-full">
                  {artist.playCount} plays
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
