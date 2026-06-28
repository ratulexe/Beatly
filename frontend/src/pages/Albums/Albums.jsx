import React from 'react';
import { useTopAlbums } from '../../hooks/useTopAlbums';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Card } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { Disc } from 'lucide-react';

export default function Albums() {
  const { data: albums, isLoading, isError } = useTopAlbums();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size={48} /></div>;
  }

  if (isError) {
    return <ErrorState title="Error loading albums" />;
  }

  return (
    <div className="pb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-400/10 text-orange-400 rounded-2xl flex items-center justify-center">
          <Disc size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Top Albums</h1>
          <p className="text-beatly-text-muted font-semibold">Your most played albums</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums?.map((album, i) => (
          <motion.div
            key={album.albumId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex flex-col group cursor-pointer hover:bg-beatly-surface-hover transition-colors h-full">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src={album.image || '/default-album.png'} 
                  alt={album.name} 
                  className="w-full aspect-square object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1 truncate">{album.name}</h3>
              <p className="text-beatly-text-muted text-sm truncate mb-3">{album.artists}</p>
              
              <div className="mt-auto flex justify-between items-center border-t border-beatly-border pt-3">
                <span className="text-xs font-bold text-beatly-text-muted">
                  {album.playCount} plays
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
