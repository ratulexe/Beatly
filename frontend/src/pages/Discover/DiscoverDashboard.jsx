import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Flame, Play, Info, Flame as FlameIcon, Search } from 'lucide-react';
import { api } from '../../services/apiClient';

import DiscoveryScore from './components/ui/DiscoveryScore';
import GenreMap from './components/ui/GenreMap';
import DiscoveryTimeline from './components/ui/DiscoveryTimeline';
import CollectionGrid from './components/ui/CollectionGrid';
import AIPickHero from './components/ui/AIPickHero';
import WhyRecommendedModal from './components/ui/WhyRecommendedModal';

const RecommendationCard = ({ rec, onWhyClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!rec.previewUrl) return window.open(`https://open.spotify.com/artist/${rec.entityId}`, '_blank');
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="min-w-[280px] w-[280px] bg-beatly-surface rounded-3xl p-5 border border-white/5 relative group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
        {rec.entityImage ? (
          <img src={rec.entityImage} alt={rec.entityName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <Compass className="text-gray-500" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={togglePlay}
            className="bg-beatly-primary text-black w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Play fill="currentColor" size={20} />
          </button>
        </div>
        {rec.previewUrl && (
          <audio 
            ref={audioRef} 
            src={rec.previewUrl} 
            onEnded={() => setIsPlaying(false)} 
          />
        )}
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white truncate max-w-[200px]">{rec.entityName}</h3>
          <p className="text-sm text-gray-400 capitalize">{rec.entityType}</p>
        </div>
        <div className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
          {rec.confidenceScore}%
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); onWhyClick(rec); }}
          className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Info size={14} /> Why this pick?
        </button>
      </div>
    </motion.div>
  );
};

const DiscoverDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);

  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const res = await api.get('/api/discover');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load discover data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscover();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-beatly-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-bold">Beatly AI is analyzing your listening...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-12 pb-32 max-w-7xl mx-auto">
      
      {/* Universal Search Mock */}
      <div className="relative max-w-2xl mx-auto mb-8 z-40">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Artists, Albums, Genres, or your Smart Collections..." 
            className="w-full bg-beatly-surface border border-white/10 rounded-full py-3 pl-12 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-all shadow-xl peer"
          />
          {/* Mock Autocomplete Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-beatly-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible peer-focus:opacity-100 peer-focus:visible transition-all pointer-events-none peer-focus:pointer-events-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Top Results</div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">A</div>
                <div className="text-sm font-medium text-white">Arctic Monkeys <span className="text-gray-500 text-xs ml-2">Artist</span></div>
              </div>
              <div className="px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">C</div>
                <div className="text-sm font-medium text-white">Currents <span className="text-gray-500 text-xs ml-2">Album</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIPickHero pick={data?.aiPickOfTheDay} onWhyClick={setSelectedRec} />

      {/* Streak Module */}
      {data?.streak && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FlameIcon className="text-orange-500" size={28} />
            </div>
            <div>
              <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Discovery Streak</div>
              <h3 className="text-white font-black text-2xl">{data.streak.days} Days</h3>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-2xl font-black text-white">{data.streak.counts?.artists || 14}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Artists</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-black text-white">{data.streak.counts?.albums || 6}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Albums</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-black text-white">{data.streak.counts?.genres || 3}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Genres</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <DiscoveryScore scoreData={data?.score} />
        <GenreMap mapData={data?.genreMap} />
        <div className="lg:col-span-2 xl:col-span-1">
          <DiscoveryTimeline timeline={data?.timeline} />
        </div>
      </div>

      {data?.forYou?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Sparkles className="text-purple-400" /> Handpicked For You
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {data.forYou.map(rec => (
              <div key={rec._id} className="snap-start">
                <RecommendationCard rec={rec} onWhyClick={setSelectedRec} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.trending?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <Flame className="text-orange-400" /> Trending & Relevant
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {data.trending.map(rec => (
              <div key={rec._id} className="snap-start">
                <RecommendationCard rec={rec} onWhyClick={setSelectedRec} />
              </div>
            ))}
          </div>
        </section>
      )}

      <CollectionGrid collections={data?.smartCollections} />

      <WhyRecommendedModal 
        isOpen={!!selectedRec} 
        onClose={() => setSelectedRec(null)} 
        rec={selectedRec} 
      />

    </div>
  );
};

export default DiscoverDashboard;
