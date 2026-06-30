import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getLevel = (count) => {
  if (count === 0) return 0;
  if (count < 10) return 1;
  if (count < 30) return 2;
  if (count < 60) return 3;
  return 4;
};

const ListeningCalendar = ({ data = [], filter = 'Listening Time' }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Songs');
  const days = ['Mon', 'Wed', 'Fri'];
  
  return (
    <div className="bg-beatly-surface border border-white/5 p-8 rounded-[2.5rem] w-full overflow-visible relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Listening Heatmap</h3>
          <p className="text-gray-400 text-sm">Your daily consistency over the last 6 months</p>
        </div>
        <div className="flex gap-2">
          {['Songs', 'Minutes'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === tab ? 'bg-beatly-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 min-w-max relative pb-4">
        {/* Y Axis Labels */}
        <div className="flex flex-col justify-between text-xs font-bold text-gray-500 py-2">
          {days.map((d, i) => (
            <span key={i} className="h-4">{d}</span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1.5 flex-1 relative">
          {Array.from({ length: 24 }).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1.5">
              {Array.from({ length: 7 }).map((_, rowIndex) => {
                const index = colIndex * 7 + rowIndex;
                const d = data[index];
                
                let val = 0;
                let displayStr = '';
                if (d) {
                  if (activeFilter === 'Songs') {
                    val = d.count || 0;
                    displayStr = `${val} Songs Played`;
                  } else if (activeFilter === 'Minutes') {
                    val = d.minutes || 0;
                    displayStr = `${val} Minutes Listened`;
                  }
                }
                
                // Adjust level threshold based on filter
                let level = 0;
                if (activeFilter === 'Minutes') {
                  if (val > 0) level = 1;
                  if (val > 30) level = 2;
                  if (val > 60) level = 3;
                  if (val > 120) level = 4;
                } else {
                  level = getLevel(val);
                }
                
                const bgColors = [
                  'bg-[#1a1a1a]', // 0
                  'bg-beatly-primary/30', // 1
                  'bg-beatly-primary/60', // 2
                  'bg-beatly-primary/80', // 3
                  'bg-beatly-primary', // 4
                ];

                const dateStr = d ? new Date(d.date).toLocaleDateString() : 'No date';

                return (
                  <div key={rowIndex} className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.002 }}
                      whileHover={{ scale: 1.5, zIndex: 50 }}
                      onMouseEnter={() => setHoveredCell({ index, val, displayStr, dateStr, x: colIndex * 22, y: rowIndex * 22 })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-4 h-4 rounded-sm ${bgColors[level]} cursor-pointer ring-black hover:ring-2 hover:shadow-[0_0_15px_rgba(29,185,84,0.5)] transition-shadow duration-300 relative z-10`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Custom Tooltip */}
        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 bg-[#222] border border-white/10 p-4 rounded-2xl shadow-2xl pointer-events-none min-w-[200px]"
              style={{ 
                left: hoveredCell.x + 40, // Offset from mouse/cell
                top: hoveredCell.y - 100 
              }}
            >
              <div className="text-gray-400 text-xs font-bold uppercase mb-2">{hoveredCell.dateStr}</div>
              <div className="text-white font-bold text-lg mb-1">{hoveredCell.displayStr}</div>
              {hoveredCell.val > 0 && (
                <div className="flex items-center gap-2 text-beatly-primary text-sm font-bold mt-2">
                  ✓ Active Day
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-[#1a1a1a]" />
          <div className="w-4 h-4 rounded-sm bg-beatly-primary/30" />
          <div className="w-4 h-4 rounded-sm bg-beatly-primary/60" />
          <div className="w-4 h-4 rounded-sm bg-beatly-primary/80" />
          <div className="w-4 h-4 rounded-sm bg-beatly-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ListeningCalendar;
