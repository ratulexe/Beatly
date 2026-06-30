import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Image, Clock, Share2, Music, Crown, TrendingUp, Calendar, Download, FileText, ChevronRight } from 'lucide-react';
import StoryViewer from './WrappedViewer/StoryViewer';
import ComparisonCard from './WrappedCompare/ComparisonCard';
import { animate, motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/apiClient';

const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = '' }) => {
  const [value, setValue] = useState(from);
  
  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        setValue(Math.round(v));
      }
    });
    return () => controls.stop();
  }, [from, to, duration]);

  return <span>{value.toLocaleString()}{suffix}</span>;
};

const THEMES = [
  { id: 'classic', name: 'Classic', color: '#1ED760' },
  { id: 'neon', name: 'Neon', color: '#ff00ff' },
  { id: 'aurora', name: 'Aurora', color: '#00ffcc' },
  { id: 'midnight', name: 'Midnight', color: '#e94560' },
  { id: 'green', name: 'Green', color: '#b4f8c8' },
  { id: 'synthwave', name: 'Synthwave', color: '#a1c4fd' }
];

export default function WrappedDashboard() {
  const [activeTheme, setActiveTheme] = useState('classic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [generateState, setGenerateState] = useState('idle'); // idle, generating, ready
  const [timeframe, setTimeframe] = useState('monthly');
  const [archive, setArchive] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [activeSlides, setActiveSlides] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const response = await api.get('/api/wrapped/archive');
      setArchive(response);
    } catch (error) {
      console.error('Failed to load wrapped archive', error);
    }
  };

  const handleGenerate = async () => {
    setGenerateState('generating');
    try {
      const year = new Date().getFullYear();
      const res = await api.post('/api/wrapped/generate', { 
        type: timeframe, 
        periodOptions: { year, month: new Date().getMonth() + 1 }
      });
      // The generate route currently returns just the report
      // So let's fetch the slides for it now
      const reportRes = await api.get(`/api/wrapped/${res._id}`);
      
      setActiveReport(reportRes.report);
      setActiveSlides(reportRes.slides);
      setGenerateState('ready');
      fetchArchive(); // Refresh archive list
    } catch (e) {
      console.error(e);
      setGenerateState('idle');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  };

  const handleExport = () => {
    showToast('Start your Story to export your Wrapped!');
  };

  const playReport = async (id) => {
    try {
      const reportRes = await api.get(`/api/wrapped/${id}`);
      setActiveReport(reportRes.report);
      setActiveSlides(reportRes.slides);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSlideContent = (slide) => {
    const { template, data } = slide;
    if (template === 'intro') {
      return (
        <div className="flex flex-col items-center justify-center gap-6">
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-center leading-tight">
            {data.title.split(' Wrapped')[0]}<br />Wrapped is here!
          </h1>
          <p className="text-xl font-medium opacity-80">Your music journey so far.</p>
        </div>
      );
    } else if (template === 'minutes_listened') {
      return (
        <div className="flex flex-col items-center justify-center gap-8 w-full px-6">
          <h2 className="text-3xl font-extrabold text-center">You couldn't stop listening.</h2>
          <div className="text-7xl font-black text-[var(--wrapped-primary)]">
            <AnimatedCounter from={0} to={data.minutes || 0} duration={2} />
          </div>
          <p className="text-xl font-bold uppercase tracking-widest">Minutes Played</p>
          <div className="w-full mt-8">
             <ComparisonCard title="Listening Time" currentValue={data.minutes || 0} previousValue={Math.round((data.minutes || 0) / (1 + ((data.delta || 0)/100)))} unit="min" />
          </div>
        </div>
      );
    } else if (template === 'top_artists') {
      return (
        <div className="flex flex-col items-center justify-center gap-6 w-full px-6">
          <h2 className="text-2xl font-bold text-center uppercase tracking-widest text-[var(--wrapped-primary)]">Your #1 Artist</h2>
          <div className="w-48 h-48 rounded-full bg-white/20 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-[var(--wrapped-primary)]">
            {data.artists?.[0]?.image ? (
              <img src={data.artists[0].image} alt={data.artists[0].name} className="w-full h-full object-cover" />
            ) : (
              <Crown size={64} className="text-[var(--wrapped-primary)]" />
            )}
          </div>
          <h1 className="text-5xl font-black text-center mt-4">{data.artists?.[0]?.name || 'Unknown'}</h1>
          <p className="text-lg font-medium opacity-80 text-center">You discovered incredible music this year.</p>
        </div>
      );
    } else if (template === 'top_tracks') {
      return (
        <div className="flex flex-col justify-center gap-6 w-full px-8">
          <h2 className="text-3xl font-extrabold mb-4">Your Top Songs</h2>
          {(data.tracks || []).slice(0, 5).map((song, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-black text-[var(--wrapped-primary)] w-8">{i + 1}</span>
              {song.image && <img src={song.image} className="w-10 h-10 rounded-md" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{song.name}</h3>
                <p className="text-sm opacity-70 truncate">{song.track}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (template === 'ai_insights') {
      return (
        <div className="flex flex-col items-center justify-center gap-8 w-full px-6">
          <Sparkles size={48} className="text-[var(--wrapped-primary)]" />
          <h2 className="text-3xl font-extrabold text-center">Your Audio Aura</h2>
          <div className="w-full aspect-square rounded-full bg-gradient-to-tr from-[var(--wrapped-primary)] to-[var(--wrapped-accent)] blur-2xl opacity-50 absolute -z-10" />
          <p className="text-2xl font-bold text-center leading-relaxed">
            {data.personality || 'Energetic & Wistful'}
          </p>
          <p className="text-sm opacity-70 text-center">{data.summary}</p>
        </div>
      );
    } else if (template === 'summary') {
      return (
        <div className="flex flex-col items-center justify-center gap-6 w-full px-6 text-center">
          <h1 className="text-4xl font-black mb-2">Beatly Wrapped</h1>
          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Top Artist</p>
              <p className="font-bold text-lg truncate">{data.topArtist || 'N/A'}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Top Song</p>
              <p className="font-bold text-lg truncate">{data.topTrack || 'N/A'}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Minutes</p>
              <p className="font-bold text-lg text-[var(--wrapped-primary)]">{data.minutes || 0}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Top Genre</p>
              <p className="font-bold text-lg truncate">{data.topGenre || 'N/A'}</p>
            </div>
          </div>
          <p className="text-sm opacity-60 mt-4">Thank you for spending your year with Beatly.</p>
        </div>
      );
    }
    return <div>Unknown Slide</div>;
  };

  const mappedSlides = activeSlides.map(slide => ({
    type: slide.template,
    content: renderSlideContent(slide)
  }));

  if (isPlaying && mappedSlides.length > 0) {
    return (
      <StoryViewer 
        slides={mappedSlides} 
        theme={activeTheme} 
        onComplete={() => setIsPlaying(false)} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white font-bold shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Beatly Wrapped</h1>
        <p className="text-beatly-text-muted text-lg">Your music journey is ready. Look back at the moments defining your year so far.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Hero Card */}
          <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 min-h-[400px] flex flex-col justify-end">
            <div className={`absolute inset-0 theme-${activeTheme} opacity-40 transition-colors duration-700`} style={{ background: 'var(--wrapped-bg)' }} />
            
            {/* Generate State Flow */}
            {generateState === 'idle' && (
              <div className="relative z-10 flex flex-col items-start gap-6 w-full max-w-lg">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-sm">
                  <Calendar size={16} /> Choose Timeframe
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Generate Your<br />Beatly Wrapped
                </h2>
                
                <div className="flex flex-wrap gap-3 mt-2">
                  {['monthly', 'quarterly', 'yearly', 'custom'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${timeframe === t ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleGenerate}
                  className="flex items-center gap-2 bg-beatly-primary text-black px-8 py-4 rounded-full font-extrabold text-lg hover:scale-105 transition-transform mt-4"
                >
                  <Sparkles fill="currentColor" size={20} />
                  Generate Now
                </button>
              </div>
            )}

            {generateState === 'generating' && (
              <div className="relative z-10 flex flex-col items-center justify-center gap-6 w-full h-full my-auto">
                <div className="w-16 h-16 border-4 border-beatly-primary border-t-transparent rounded-full animate-spin" />
                <h2 className="text-2xl font-black text-white">Analyzing your audio aura...</h2>
                <p className="text-beatly-text-muted">Beatly AI is scanning thousands of listening events.</p>
              </div>
            )}

            {generateState === 'ready' && activeReport && (
              <div className="relative z-10 flex flex-col items-start gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-sm">
                  <Sparkles size={16} /> Ready to Play
                </div>
                
                {/* Stats Preview Overlay */}
                <div className="flex flex-wrap gap-4 mb-2">
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-beatly-primary font-bold">{activeReport.stats?.topArtists?.length || 0}</span> Artists
                  </div>
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-beatly-primary font-bold">{activeReport.stats?.totalListeningMinutes?.toLocaleString() || 0}</span> Minutes
                  </div>
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-beatly-primary font-bold">{activeReport.aiInsights?.personality?.split(' ')[0] || 'Vibe'}</span> Personality
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Play your<br />Beatly Wrapped
                </h2>
                
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-extrabold text-lg hover:scale-105 transition-transform"
                  >
                    <Play fill="currentColor" size={20} />
                    Start Story
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 bg-white/10 text-white px-6 py-4 rounded-full font-bold hover:bg-white/20 transition-colors">
                    <Share2 size={20} /> Share
                  </button>
                  <button onClick={handleExport} className="flex items-center gap-2 bg-white/10 text-white px-6 py-4 rounded-full font-bold hover:bg-white/20 transition-colors">
                    <Download size={20} /> Export
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Story Strip */}
          {generateState === 'ready' && (
            <div className="flex items-center justify-between bg-beatly-surface p-4 rounded-2xl border border-white/5 overflow-x-auto gap-4 hide-scrollbar">
              <div className="text-xs font-bold uppercase tracking-widest text-beatly-text-muted whitespace-nowrap shrink-0">Story Preview</div>
              <div className="w-px h-8 bg-white/10 shrink-0 mx-2" />
              {['Welcome', 'Top Artist', 'Top Songs', 'Audio Aura', 'Summary'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="shrink-0 text-sm font-bold text-white/80">{step}</div>
                  {i < 4 && <ChevronRight size={14} className="text-white/20 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold">Customize Your Story</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex flex-col items-center gap-3 p-3 rounded-2xl glass-panel transition-all ${
                    activeTheme === theme.id ? 'border-beatly-primary bg-white/5 ring-2 ring-beatly-primary/50' : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div 
                    className={`w-full aspect-[9/16] rounded-xl shadow-lg flex flex-col justify-end p-2 theme-${theme.id}`}
                    style={{ background: 'var(--wrapped-bg)' }}
                  >
                    <div className="w-full h-8 bg-black/20 backdrop-blur-md rounded border border-white/10" />
                  </div>
                  <span className="text-xs font-bold">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* What's New This Year */}
          {generateState === 'ready' && activeReport && (
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 bg-gradient-to-br from-beatly-primary/20 to-transparent border-beatly-primary/30">
              <h3 className="text-sm font-bold uppercase tracking-widest text-beatly-primary">Biggest Change</h3>
              <p className="text-xl font-bold leading-relaxed">
                You listened to <span className="text-white font-black text-2xl">{Math.abs(activeReport.stats?.deltas?.listeningTimePercentChange || 0)}% {activeReport.stats?.deltas?.listeningTimePercentChange >= 0 ? 'more' : 'less'}</span> music than last year.
              </p>
            </div>
          )}

          {/* Stats Teaser */}
          {activeReport && (
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-beatly-primary" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-xs text-beatly-text-muted font-bold uppercase tracking-wider mb-1">Top Artist</p>
                  <p className="text-lg font-black truncate">{activeReport.stats?.topArtists?.[0]?.name || 'N/A'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-xs text-beatly-text-muted font-bold uppercase tracking-wider mb-1">Top Genre</p>
                  <p className="text-lg font-black truncate">{activeReport.stats?.topGenres?.[0]?.genre || 'N/A'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-xs text-beatly-text-muted font-bold uppercase tracking-wider mb-1">Discovery Score</p>
                  <p className="text-lg font-black truncate text-green-400">{activeReport.stats?.discoveryScore || 0} / 100</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-xs text-beatly-text-muted font-bold uppercase tracking-wider mb-1">Longest Streak</p>
                  <p className="text-lg font-black truncate">{activeReport.stats?.longestStreak || 0} Days</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <ComparisonCard 
                  title="Total Minutes" 
                  currentValue={activeReport.stats?.totalListeningMinutes || 0} 
                  previousValue={Math.round((activeReport.stats?.totalListeningMinutes || 0) / (1 + ((activeReport.stats?.deltas?.listeningTimePercentChange || 0)/100)))} 
                  unit="min" 
                />
                <ComparisonCard 
                  title="Artists Discovered" 
                  currentValue={activeReport.stats?.topArtists?.length || 0} 
                  previousValue={activeReport.stats?.topArtists?.length || 0} 
                />
              </div>
            </div>
          )}

          {/* Archive */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-beatly-primary" />
              Wrapped Archive
            </h3>
            <div className="flex flex-col gap-3 mt-2">
              {archive.length === 0 && <p className="text-sm opacity-60">No past wrapped reports found.</p>}
              {archive.map(rep => (
                <div key={rep._id} className="flex flex-col p-4 rounded-2xl bg-beatly-surface hover:bg-beatly-surface-hover transition-colors group border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                      <Music size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">Beatly Wrapped {rep.period?.year || new Date(rep.createdAt).getFullYear()}</h4>
                      <p className="text-xs text-beatly-text-muted font-medium">
                        Generated {new Date(rep.createdAt).toLocaleDateString()} • {rep.type}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => playReport(rep._id)} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                      <Play size={14} /> Replay
                    </button>
                    <button onClick={handleShare} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                      <Share2 size={14} /> Share
                    </button>
                    <button onClick={handleExport} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
                      <Download size={14} /> Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
