import { AnalyticsSnapshot } from '../../models/AnalyticsSnapshot.model.js';
import { WrappedReport } from '../../models/WrappedReport.model.js';
import { WrappedSlide } from '../../models/WrappedSlide.model.js';
import { WrappedShare } from '../../models/WrappedShare.model.js';
import { generateAIInsights } from './summary.service.js';
import { comparePeriods, getPreviousReport } from './comparison.service.js';
import { discoveryMetricsService } from '../discover/discoveryMetrics.service.js';
import logger from '../../config/logger.js';

export const generateWrappedReport = async (userId, type, periodOptions) => {
  try {
    let snapshotQuery = { userId: userId };
    if (type === 'monthly') {
      snapshotQuery.periodType = 'monthly';
    } else if (type === 'yearly') {
      snapshotQuery.periodType = 'overall'; // fallback if no yearly specific
    } else {
      snapshotQuery.periodType = 'overall';
    }

    let snapshot = await AnalyticsSnapshot.findOne(snapshotQuery).sort({ periodStart: -1 });
    
    // Fallback for local development if the user hasn't generated analytics yet
    if (!snapshot) {
      snapshot = await AnalyticsSnapshot.findOne({ periodType: snapshotQuery.periodType }).sort({ periodStart: -1 });
    }
    if (!snapshot) {
      snapshot = await AnalyticsSnapshot.findOne({ periodType: 'overall' }).sort({ periodStart: -1 });
    }

    if (!snapshot) {
      throw new Error('No analytics data found for the given period.');
    }

    const discoveryData = await discoveryMetricsService.calculateScore(userId);
    const streakData = await discoveryMetricsService.calculateStreak(userId);

    const stats = {
      totalListeningMinutes: Math.round((snapshot.listening?.totalMs || 0) / 60000),
      topArtists: (snapshot.topArtists || []).slice(0, 5).map(a => ({
        artist: a.artistId ? a.artistId.toString() : 'Unknown Artist',
        playCount: a.playCount,
        name: a.name,
        image: a.image
      })),
      topTracks: (snapshot.topTracks || []).slice(0, 5).map(t => ({
        track: t.artists ? t.artists.join(', ') : 'Unknown Artist',
        playCount: t.playCount,
        name: t.name,
        image: t.albumImage || t.image
      })),
      topGenres: (snapshot.genres && snapshot.genres.length > 0 ? snapshot.genres : [{ genre: 'Pop', count: 1 }]).slice(0, 5).map(g => ({
        genre: g.genre,
        count: g.count
      })),
      discoveryScore: discoveryData?.score || 0,
      longestStreak: streakData?.days || 0,
      deltas: {}
    };

    const previousReport = await getPreviousReport(userId, type, periodOptions);
    if (previousReport) {
      stats.deltas = comparePeriods(stats, previousReport.stats);
    }

    const aiInsights = await generateAIInsights(stats);

    let report = await WrappedReport.findOne({
      user: userId,
      type: type,
      'period.year': periodOptions.year,
      'period.month': periodOptions.month
    });

    if (report) {
      report.snapshot = snapshot._id;
      report.stats = stats;
      report.aiInsights = aiInsights;
      await report.save();
      await WrappedSlide.deleteMany({ report: report._id });
    } else {
      report = new WrappedReport({
        user: userId,
        type,
        period: periodOptions,
        snapshot: snapshot._id,
        stats,
        aiInsights
      });
      await report.save();
    }

    const slidesData = [
      {
        order: 1,
        template: 'intro',
        data: { title: `Your ${type === 'yearly' ? periodOptions.year || new Date().getFullYear() : 'Monthly'} Wrapped is here!` },
        bgColor: '#1db954'
      },
      {
        order: 2,
        template: 'minutes_listened',
        data: { minutes: stats.totalListeningMinutes, delta: stats.deltas.listeningTimePercentChange },
        bgColor: '#ff4632'
      },
      {
        order: 3,
        template: 'top_artists',
        data: { artists: stats.topArtists },
        bgColor: '#2e77d0'
      },
      {
        order: 4,
        template: 'top_tracks',
        data: { tracks: stats.topTracks },
        bgColor: '#ffc864'
      },
      {
        order: 5,
        template: 'ai_insights',
        data: { personality: aiInsights.personality, summary: aiInsights.summary, roast: aiInsights.roast },
        bgColor: '#509bf5'
      },
      {
        order: 6,
        template: 'summary',
        data: {
          topArtist: stats.topArtists?.[0]?.name,
          topTrack: stats.topTracks?.[0]?.name,
          minutes: stats.totalListeningMinutes,
          topGenre: stats.topGenres?.[0]?.genre
        },
        bgColor: '#1db954'
      }
    ];

    const slidePromises = slidesData.map(slide => {
      return new WrappedSlide({
        report: report._id,
        user: userId,
        ...slide
      }).save();
    });

    await Promise.all(slidePromises);

    return report;
  } catch (error) {
    logger.error('[WrappedService] Error generating wrapped report:', error);
    throw error;
  }
};

export const getWrappedReport = async (reportId, userId) => {
  return await WrappedReport.findOne({ _id: reportId, user: userId }).populate('snapshot');
};

export const getWrappedSlides = async (reportId, userId) => {
  return await WrappedSlide.find({ report: reportId, user: userId }).sort({ order: 1 });
};

export const getWrappedArchive = async (userId) => {
  return await WrappedReport.find({ user: userId }).sort({ createdAt: -1 });
};

export const shareWrappedReport = async (reportId, userId, slidesIds, theme) => {
  const share = new WrappedShare({
    report: reportId,
    user: userId,
    slidesToShare: slidesIds,
    theme: theme || 'default',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  });
  await share.save();
  return share;
};
