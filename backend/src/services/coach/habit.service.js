import { Habit } from '../../models/Habit.model.js';
import { analyticsRepository } from '../database/analyticsRepository.js';

export const habitService = {
  async detectHabits(userId) {
    const snapshot = await analyticsRepository.getLatestSnapshot(userId, 'overall');
    if (!snapshot) return [];

    const habits = [];
    
    // 1. Night Listener Habit
    const totalSongs = snapshot.listening?.totalSongs || 1; // Prevent division by zero
    const nightPlays = snapshot.timeInsights?.periods?.night?.playCount || 0;
    const nightPercentage = (nightPlays / totalSongs) * 100;
    
    if (nightPercentage > 40) {
      habits.push({
        habit: 'Night Listener',
        confidence: nightPercentage / 100,
        evidence: [`${Math.round(nightPercentage)}% of your listening occurs late at night.`]
      });
    }

    // 2. Artist Loyalist Habit
    if (snapshot.topArtists?.length > 0) {
      const topArtist = snapshot.topArtists[0];
      if (topArtist.playCount > (totalSongs * 0.3)) {
        habits.push({
          habit: 'Artist Loyalist',
          confidence: 0.85,
          evidence: [`You listened to ${topArtist.name || 'your favorite artist'} for over 30% of your total streams.`]
        });
      }
    }

    // 3. Genre Explorer
    if (snapshot.genres && snapshot.genres.length > 5) {
      habits.push({
        habit: 'Genre Explorer',
        confidence: 0.90,
        evidence: [`You frequently listen to ${snapshot.genres.length} different genres.`]
      });
    }

    // 4. Morning Listener
    const morningPlays = snapshot.timeInsights?.periods?.morning?.playCount || 0;
    const morningPercentage = (morningPlays / totalSongs) * 100;

    if (morningPercentage > 30) {
      habits.push({
        habit: 'Morning Listener',
        confidence: morningPercentage / 100,
        evidence: [`${Math.round(morningPercentage)}% of your listening happens in the morning.`]
      });
    }

    // Save habits
    for (const h of habits) {
      await Habit.findOneAndUpdate(
        { userId, habit: h.habit },
        { 
          confidence: h.confidence,
          evidence: h.evidence,
          lastDetected: new Date()
        },
        { upsert: true, new: true }
      );
    }

    return Habit.find({ userId }).sort({ confidence: -1 });
  },

  async getHabits(userId) {
    return Habit.find({ userId }).sort({ confidence: -1 });
  }
};
