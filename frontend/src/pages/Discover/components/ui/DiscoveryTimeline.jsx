import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const DiscoveryTimeline = ({ timeline }) => {
  const defaultTimeline = [
    { year: 'Today', label: 'Started Indie', image: 'https://picsum.photos/seed/indie/150/150' },
    { year: '3 days ago', label: 'Discovered Jazz', image: 'https://picsum.photos/seed/jazz/150/150' },
    { year: 'Last week', label: 'First Vinyl Album', image: 'https://picsum.photos/seed/vinyl/150/150' },
    { year: 'Last month', label: '100 Artists', image: 'https://picsum.photos/seed/artists/150/150' },
    { year: '2 months ago', label: 'Shoegaze unlocked', image: 'https://picsum.photos/seed/shoegaze/150/150' }
  ];
  
  const data = timeline || defaultTimeline;

  return (
    <div className="bg-beatly-surface border border-white/5 rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400">
          <Clock size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white">Discovery Timeline</h3>
          <p className="text-xs text-gray-400">Your recent musical milestones</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="relative pl-6 space-y-6 mt-2">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
          
          {data.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 relative group"
            >
              <div className="absolute -left-[1.6rem] w-3 h-3 rounded-full bg-yellow-400 border-2 border-beatly-bg shadow-[0_0_10px_rgba(250,204,21,0.5)] group-hover:scale-125 transition-transform" />
              <img 
                src={item.image} 
                alt={item.label} 
                className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10 group-hover:border-yellow-400/50 transition-colors"
              />
              <div>
                <p className="text-white font-bold text-sm mb-1">{item.label}</p>
                <p className="text-yellow-400 font-bold text-xs">{item.year}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTimeline;
