import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, User, Disc } from 'lucide-react';

const GenreMap = ({ mapData }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = mapData || [];

  return (
    <div className="bg-beatly-surface border border-white/5 rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
          <Map size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white">Genre Exploration Path</h3>
          <p className="text-xs text-gray-400">Your real listening genres and recommendations</p>
        </div>
      </div>

      {nodes.length === 0 && (
        <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400 flex items-center justify-center">
          Genre paths will appear after Beatly detects enough genre variety.
        </div>
      )}

      {nodes.length > 0 && <div className="flex items-start justify-between mt-6 relative px-4 flex-shrink-0">
        {/* Connection Line */}
        <div className="absolute top-6 left-12 right-12 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-beatly-primary"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>

        {nodes.map((node, i) => (
          <div key={node.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-beatly-bg transition-transform hover:scale-110 shadow-lg ${
              node.type === 'origin' ? 'bg-gray-600' :
              node.type === 'destination' ? 'bg-beatly-primary text-black' :
              'bg-purple-500'
            }`}>
              {i + 1}
            </div>
            <div className="mt-3 text-center w-20 md:w-24">
              <span className={`text-xs md:text-sm font-bold block transition-colors leading-snug ${selectedNode === node.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {node.name}
              </span>
            </div>
          </div>
        ))}
      </div>}

      <div className="flex-1 mt-4 overflow-y-auto">
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/40 rounded-2xl p-4 border border-white/5"
            >
              {nodes.filter(n => n.id === selectedNode).map(node => (
                <div key={node.id} className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12}/> Top Artists</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(node.artists || []).map(a => <li key={a} className="hover:text-white cursor-pointer transition-colors">{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Disc size={12}/> Essential Albums</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(node.albums || []).map(a => <li key={a} className="hover:text-white cursor-pointer transition-colors">{a}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenreMap;
