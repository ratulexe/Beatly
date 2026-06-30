import React, { useRef, useState } from 'react';
import { Play, Pause, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const AIPickHero = ({ pick, onWhyClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!pick) {
    return (
      <div className="bg-beatly-surface border border-white/10 rounded-[2.5rem] p-10 h-64 flex items-center justify-center">
        <p className="text-gray-400">Beatly AI is analyzing your listening...</p>
      </div>
    );
  }

  const togglePlay = () => {
    if (!pick.previewUrl) return window.open(`https://open.spotify.com/artist/${pick.entityId}`, '_blank');
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative overflow-hidden bg-beatly-surface border border-white/10 rounded-[2.5rem]">
      {/* Background blur from image */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl scale-110"
        style={{ backgroundImage: `url(${pick.entityImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
      />
      
      <div className="relative p-10 flex flex-col md:flex-row items-center gap-12 z-10">
        
        {/* Left Side: Artwork */}
        <div className="relative group w-64 h-64 flex-shrink-0">
          {pick.entityImage ? (
            <img
              src={pick.entityImage}
              alt={pick.entityName}
              className="w-full h-full object-cover rounded-3xl shadow-2xl shadow-purple-900/20"
            />
          ) : (
            <div className="w-full h-full rounded-3xl bg-white/5 border border-white/10 shadow-2xl shadow-purple-900/20" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
            <button 
              onClick={togglePlay}
              className="bg-beatly-primary text-black w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
            </button>
          </div>
          {pick.previewUrl && (
            <audio 
              ref={audioRef} 
              src={pick.previewUrl} 
              onEnded={() => setIsPlaying(false)} 
            />
          )}
        </div>

        {/* Right Side: Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold mb-4 backdrop-blur-md">
            <Sparkles size={14} className="text-purple-400" />
            AI Pick of the Day
          </div>
          
          <h1 className="text-5xl font-black text-white mb-2">{pick.entityName}</h1>
          <p className="text-xl text-gray-300 font-medium mb-6 capitalize">{pick.category}</p>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
            </div>
          </div>
          
          <p className="text-gray-300 text-lg mb-6 leading-relaxed max-w-2xl">
            {pick.aiExplanation}
          </p>

          {pick.tags && pick.tags.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Because you enjoy:</p>
              <ul className="space-y-1">
                {pick.tags.map(tag => (
                  <li key={tag} className="text-gray-200 flex items-center gap-2 text-sm font-medium">
                    <span className="w-1.5 h-1.5 bg-beatly-primary rounded-full"></span>
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 inline-block text-left relative overflow-hidden group cursor-pointer" onClick={() => onWhyClick(pick)}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-gray-400 text-sm font-semibold mb-2">Why?</h3>
            <p className="text-white">You listen to <span className="font-bold text-beatly-primary">{pick.tags?.[0] || 'Similar Artists'}</span></p>
            <div className="mt-3 text-xs text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              See full breakdown &rarr;
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AIPickHero;
