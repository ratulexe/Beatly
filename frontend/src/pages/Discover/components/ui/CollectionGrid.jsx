import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

const CollectionGrid = ({ collections }) => {
  const items = collections || [];

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">Smart Collections</h2>
      {items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-beatly-surface p-8 text-center text-gray-400">
          Smart collections will appear after Beatly has enough listening data.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl border border-white/10 relative overflow-hidden group cursor-pointer h-48 flex flex-col justify-end`}
          >
            {/* 2x2 Image Collage */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              {(collection.covers || []).slice(0, 4).map((cover, idx) => (
                <div key={idx} className="relative w-full h-full">
                  <img src={cover} alt="cover" className="w-full h-full object-cover" />
                </div>
              ))}
              {(collection.covers || []).length === 0 && (
                <div className="col-span-2 row-span-2 bg-white/5" />
              )}
            </div>
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black group-hover:via-black/60 transition-colors" />
            <div className="absolute top-4 right-4 bg-white/10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">{collection.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
              <span>{collection.tracks} Tracks</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <span>{collection.artists} Artists</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CollectionGrid;
