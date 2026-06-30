import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export const ProfileHeader = ({ profile }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-beatly-surface/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-beatly-primary/10 to-transparent pointer-events-none" />
      
      {profile.profileImage ? (
        <img loading="lazy" src={profile.profileImage} 
          alt={profile.displayName} 
          className="w-32 h-32 rounded-full shadow-2xl object-cover ring-4 ring-white/10"
        />
      ) : (
        <div className="w-32 h-32 rounded-full shadow-2xl bg-white/10 flex items-center justify-center text-4xl ring-4 ring-white/10">
          {profile.displayName?.charAt(0)}
        </div>
      )}

      <div className="flex-1 text-center md:text-left z-10">
        <h1 className="text-4xl font-bold text-white mb-2">{profile.displayName}</h1>
        <p className="text-gray-400 text-lg mb-4">{profile.email}</p>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="text-beatly-primary font-bold">Lvl {Math.floor(0.1 * Math.sqrt(profile.xp || 0)) + 1}</span>
            <span className="text-sm text-gray-400">({profile.xp || 0} XP)</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <span className="text-yellow-400 font-bold">🔥 {profile.currentStreak || 0} Day Streak</span>
          </div>

          {profile.listeningPersonality && (
            <div className="flex items-center gap-2 bg-beatly-primary/10 px-4 py-2 rounded-full border border-beatly-primary/30">
              <span className="text-beatly-primary font-bold">{profile.listeningPersonality}</span>
            </div>
          )}
        </div>
      </div>

      <div className="z-10">
        <a 
          href={profile.spotifyProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-beatly-primary hover:bg-beatly-primary/90 text-black px-6 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
        >
          View on Spotify
          <ExternalLink size={18} />
        </a>
      </div>
    </motion.div>
  );
};
