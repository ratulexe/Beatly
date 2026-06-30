import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

const CollectionGrid = ({ collections }) => {
  const items = collections || [
    { 
      id: 1, 
      name: 'Hidden Gems', 
      tracks: 24, 
      artists: 8, 
      covers: ['https://picsum.photos/seed/a1/150/150', 'https://picsum.photos/seed/a2/150/150', 'https://picsum.photos/seed/a3/150/150', 'https://picsum.photos/seed/a4/150/150']
    },
    { 
      id: 2, 
      name: 'Late Night Favorites', 
      tracks: 18, 
      artists: 12, 
      covers: ['https://picsum.photos/seed/b1/150/150', 'https://picsum.photos/seed/b2/150/150', 'https://picsum.photos/seed/b3/150/150', 'https://picsum.photos/seed/b4/150/150']
    },
    { 
      id: 3, 
      name: 'Workout Mix Candidates', 
      tracks: 30, 
      artists: 25, 
      covers: ['https://picsum.photos/seed/c1/150/150', 'https://picsum.photos/seed/c2/150/150', 'https://picsum.photos/seed/c3/150/150', 'https://picsum.photos/seed/c4/150/150']
    },
    { 
      id: 4, 
      name: 'Weekend Vibes', 
      tracks: 42, 
      artists: 15, 
      covers: ['https://picsum.photos/seed/d1/150/150', 'https://picsum.photos/seed/d2/150/150', 'https://picsum.photos/seed/d3/150/150', 'https://picsum.photos/seed/d4/150/150']
    }
  ];

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">Smart Collections</h2>
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
              {collection.covers.map((cover, idx) => (
                <div key={idx} className="relative w-full h-full">
                  <img src={cover} alt="cover" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black group-hover:via-black/60 transition-colors" />
            <div className="absolute top-4 right-4 bg-white/10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="text-white" />
            </div>
            <div className="absolute top-4 left-4 bg-black/40 text-[10px] uppercase font-bold px-2 py-1 rounded-md text-gray-300">
              Updated Today
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
