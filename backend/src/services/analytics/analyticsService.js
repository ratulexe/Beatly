import { ListeningHistory } from '../../database/index.js';
import { analyticsRepository } from '../database/analyticsRepository.js';
import {
  buildOverviewPipeline,
  buildTopArtistsPipeline,
  buildTopTracksPipeline,
  buildTopAlbumsPipeline,
  buildGenrePipeline,
  buildTimeInsightsPipeline
} from './aggregationPipelines.js';

/**
 * Converts raw hourly/dayOfWeek facet results into padded arrays
 */
const padHourlyArray = (hourlyResults) => {
  const arr = Array.from({ length: 24 }, () => ({ playCount: 0, totalMs: 0 }));
  for (const h of hourlyResults) {
    arr[h._id] = { playCount: h.playCount, totalMs: h.totalMs };
  }
  return arr;
};

const padDayOfWeekArray = (dowResults) => {
  // MongoDB $dayOfWeek: 1=Sunday ... 7=Saturday
  const arr = Array.from({ length: 7 }, () => ({ playCount: 0, totalMs: 0 }));
  for (const d of dowResults) {
    arr[d._id - 1] = { playCount: d.playCount, totalMs: d.totalMs };
  }
  return arr;
};

const computePeriods = (hourlyArray) => {
  const sum = (start, end) => {
    let playCount = 0, totalMs = 0;
    for (let i = start; i < end; i++) {
      playCount += hourlyArray[i].playCount;
      totalMs += hourlyArray[i].totalMs;
    }
    return { playCount, totalMs };
  };

  return {
    morning: sum(6, 12),      // 6am-12pm
    afternoon: sum(12, 17),   // 12pm-5pm
    evening: sum(17, 21),     // 5pm-9pm
    night: {                  // 9pm-6am (wraps around)
      playCount: sum(21, 24).playCount + sum(0, 6).playCount,
      totalMs: sum(21, 24).totalMs + sum(0, 6).totalMs
    }
  };
};

/**
 * Generate overall stats for a user (all-time)
 */
export const generateOverallStats = async (userId) => {
  const startTime = Date.now();

  // Run all pipelines in parallel
  const [overviewResult, topArtists, topTracks, topAlbums, genreResults, timeResult] = await Promise.all([
    ListeningHistory.aggregate(buildOverviewPipeline(userId)),
    ListeningHistory.aggregate(buildTopArtistsPipeline(userId)),
    ListeningHistory.aggregate(buildTopTracksPipeline(userId)),
    ListeningHistory.aggregate(buildTopAlbumsPipeline(userId)),
    ListeningHistory.aggregate(buildGenrePipeline(userId)),
    ListeningHistory.aggregate(buildTimeInsightsPipeline(userId))
  ]);

  const overview = overviewResult[0] || { totalMs: 0, totalSongs: 0, uniqueTracks: 0, uniqueArtists: 0, uniqueAlbums: 0 };
  const timeFacet = timeResult[0] || { hourly: [], dayOfWeek: [] };

  const hourlyArray = padHourlyArray(timeFacet.hourly || []);
  const dayOfWeekArray = padDayOfWeekArray(timeFacet.dayOfWeek || []);

  const snapshotData = {
    listening: {
      totalMs: overview.totalMs,
      totalSongs: overview.totalSongs,
      uniqueTracks: overview.uniqueTracks,
      uniqueArtists: overview.uniqueArtists,
      uniqueAlbums: overview.uniqueAlbums
    },
    topArtists,
    topTracks,
    topAlbums,
    genres: genreResults,
    timeInsights: {
      hourly: hourlyArray,
      dayOfWeek: dayOfWeekArray,
      periods: computePeriods(hourlyArray)
    }
  };

  // Use epoch start and far future for "overall"
  const periodStart = new Date('2020-01-01');
  const periodEnd = new Date('2099-12-31');

  const saved = await analyticsRepository.saveSnapshot(userId, 'overall', periodStart, periodEnd, snapshotData);

  const duration = Date.now() - startTime;
  console.log(`[Analytics] Overall stats generated for user ${userId} in ${duration}ms`);

  return saved;
};

/**
 * Generate daily stats for a specific date
 */
export const generateDailyStats = async (userId, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [overviewResult, topTracks, topArtists] = await Promise.all([
    ListeningHistory.aggregate(buildOverviewPipeline(userId, dayStart, dayEnd)),
    ListeningHistory.aggregate(buildTopTracksPipeline(userId, dayStart, dayEnd, 10)),
    ListeningHistory.aggregate(buildTopArtistsPipeline(userId, dayStart, dayEnd, 10))
  ]);

  const overview = overviewResult[0] || { totalMs: 0, totalSongs: 0, uniqueTracks: 0, uniqueArtists: 0, uniqueAlbums: 0 };

  const snapshotData = {
    listening: {
      totalMs: overview.totalMs,
      totalSongs: overview.totalSongs,
      uniqueTracks: overview.uniqueTracks,
      uniqueArtists: overview.uniqueArtists,
      uniqueAlbums: overview.uniqueAlbums
    },
    topTracks,
    topArtists
  };

  return analyticsRepository.saveSnapshot(userId, 'daily', dayStart, dayEnd, snapshotData);
};

/**
 * Main entry point: generates overall + last 7 days of daily stats.
 * Called after track synchronization.
 */
export const generateAllAnalytics = async (userId) => {
  const startTime = Date.now();

  try {
    // Generate overall stats
    await generateOverallStats(userId);

    // Generate daily stats for the last 7 days
    const dailyPromises = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyPromises.push(generateDailyStats(userId, date));
    }
    await Promise.all(dailyPromises);

    const duration = Date.now() - startTime;
    console.log(`[Analytics] All analytics generated for user ${userId} in ${duration}ms`);
  } catch (error) {
    console.error(`[Analytics] Failed to generate analytics for user ${userId}:`, error.message);
    // Don't rethrow — analytics generation should not block sync
  }
};
