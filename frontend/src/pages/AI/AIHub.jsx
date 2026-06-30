import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, User, Music, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiApi } from '../../services/api/aiApi';
import DashboardLayout from '../../layouts/DashboardLayout';
import ReactMarkdown from 'react-markdown';

const AIHub = () => {
  const [data, setData] = useState({
    insights: null,
    recommendations: null,
    personality: null,
    predictions: null
  });
  // We'll track loading per card now
  const [loading, setLoading] = useState({
    insights: true,
    recommendations: true,
    personality: true,
    predictions: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch independently so the page doesn't block for 5 minutes waiting on Ollama queue
    aiApi.getInsights()
      .then(res => setData(prev => ({ ...prev, insights: res.data })))
      .catch(() => setData(prev => ({ ...prev, insights: [] })))
      .finally(() => setLoading(prev => ({ ...prev, insights: false })));

    aiApi.getRecommendations()
      .then(res => setData(prev => ({ ...prev, recommendations: res.data })))
      .catch(() => setData(prev => ({ ...prev, recommendations: [] })))
      .finally(() => setLoading(prev => ({ ...prev, recommendations: false })));

    aiApi.getPersonality()
      .then(res => setData(prev => ({ ...prev, personality: res.data })))
      .catch(() => setData(prev => ({ ...prev, personality: null })))
      .finally(() => setLoading(prev => ({ ...prev, personality: false })));

    aiApi.getPredictions()
      .then(res => setData(prev => ({ ...prev, predictions: res.data })))
      .catch(() => setData(prev => ({ ...prev, predictions: [] })))
      .finally(() => setLoading(prev => ({ ...prev, predictions: false })));
  }, []);

  const isLoadingAny = Object.values(loading).every(Boolean);

  if (isLoadingAny) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-beatly-text-muted">
        <Sparkles size={48} className="animate-pulse text-beatly-primary mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Analyzing your listening habits...</h2>
        <p>Beatly AI is crunching the numbers.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-beatly-error/10 text-beatly-error p-6 rounded-xl text-center">
        {error}
      </div>
    );
  }

  const { insights, recommendations, personality, predictions } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-beatly-primary/20 flex items-center justify-center text-beatly-primary">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Beatly Intelligence</h1>
          <p className="text-beatly-text-muted">AI-powered insights based on your listening history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personality & Predictions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Personality Card */}
          {loading.personality ? (
            <div className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border animate-pulse h-64"></div>
          ) : personality && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-beatly-primary/10 rounded-bl-full -mr-4 -mt-4 blur-2xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <User className="text-beatly-primary" />
                <h2 className="text-xl font-bold">Listening Personality</h2>
              </div>
              <h3 className="text-2xl font-extrabold text-beatly-primary mb-2">{personality.name || 'Unknown'}</h3>
              <p className="text-gray-300 mb-4">{personality.description}</p>
              
              {personality.strengths && (
                <div className="mb-4">
                  <h4 className="text-sm text-beatly-text-muted font-bold uppercase mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {personality.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-beatly-primary mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Predictions Card */}
          {loading.predictions ? (
            <div className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border animate-pulse h-48"></div>
          ) : predictions && predictions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-purple-400" />
                <h2 className="text-xl font-bold">Future Predictions</h2>
              </div>
              <ul className="space-y-4">
                {predictions.map((p, i) => (
                  <li key={i} className="bg-black/20 p-4 rounded-xl text-sm text-gray-300 border border-white/5">
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right Column: Insights & Recommendations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Insights Card */}
          {loading.insights ? (
            <div className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border animate-pulse h-64"></div>
          ) : insights && insights.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-400 fill-yellow-400/20" />
                <h2 className="text-xl font-bold">Key Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => (
                  <div key={i} className="bg-black/30 p-5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-beatly-primary rounded-l-xl"></div>
                    <p className="text-gray-200">{insight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommendations Card */}
          {loading.recommendations ? (
            <div className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border animate-pulse h-64"></div>
          ) : recommendations && recommendations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-beatly-surface p-6 rounded-2xl border border-beatly-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <Music className="text-pink-400" />
                <h2 className="text-xl font-bold">AI Recommendations</h2>
              </div>
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-pink-400/10 flex items-center justify-center text-pink-400">
                      <Music size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{rec.recommendation}</h4>
                      <p className="text-sm text-gray-400">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHub;
