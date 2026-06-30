import logger from '../../config/logger.js';
import { WrappedReport } from '../../models/WrappedReport.model.js';

/**
 * Compares current stats with previous period stats to generate deltas
 */
export const comparePeriods = (currentStats, previousStats) => {
  try {
    const deltas = {
      listeningTimePercentChange: 0,
      newArtistsDiscovered: 0
    };

    if (previousStats && previousStats.totalListeningMinutes > 0) {
      const diff = currentStats.totalListeningMinutes - previousStats.totalListeningMinutes;
      deltas.listeningTimePercentChange = Math.round((diff / previousStats.totalListeningMinutes) * 100);
    } else if (previousStats && previousStats.totalListeningMinutes === 0 && currentStats.totalListeningMinutes > 0) {
      deltas.listeningTimePercentChange = 100;
    }

    if (previousStats && previousStats.topArtists && currentStats.topArtists) {
      const prevArtistNames = new Set(previousStats.topArtists.map(a => a.artist));
      const newArtists = currentStats.topArtists.filter(a => !prevArtistNames.has(a.artist));
      deltas.newArtistsDiscovered = newArtists.length;
    } else if (!previousStats && currentStats.topArtists) {
      deltas.newArtistsDiscovered = currentStats.topArtists.length;
    }

    return deltas;
  } catch (error) {
    logger.error('[ComparisonService] Error comparing periods:', error);
    return {
      listeningTimePercentChange: 0,
      newArtistsDiscovered: 0
    };
  }
};

/**
 * Fetches the previous report for comparison
 */
export const getPreviousReport = async (userId, currentType, currentPeriod) => {
  try {
    let query = { user: userId, type: currentType };
    
    if (currentType === 'monthly') {
      const isJan = currentPeriod.month === 1;
      query['period.year'] = isJan ? currentPeriod.year - 1 : currentPeriod.year;
      query['period.month'] = isJan ? 12 : currentPeriod.month - 1;
    } else if (currentType === 'yearly') {
      query['period.year'] = currentPeriod.year - 1;
    } else {
      return null; // For custom, we might not easily know what "previous" is unless ordered by date
    }

    const previousReport = await WrappedReport.findOne(query).sort({ createdAt: -1 });
    return previousReport;
  } catch (error) {
    logger.error('[ComparisonService] Error fetching previous report:', error);
    return null;
  }
};
