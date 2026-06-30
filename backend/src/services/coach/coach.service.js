import { goalService } from './goal.service.js';
import { challengeService } from './challenge.service.js';
import { habitService } from './habit.service.js';
import { analyticsRepository } from '../database/analyticsRepository.js';

export const coachService = {
  async getDashboard(userId) {
    // Aggregates everything for the dashboard UI
    const analytics = await analyticsRepository.getLatestSnapshot(userId, 'overall');
    const goals = await goalService.getActiveGoals(userId);
    const habits = await habitService.detectHabits(userId); // Or getHabits to be faster
    
    // Auto-generate a daily goal if none exists
    if (goals.length === 0 && analytics) {
      const newGoal = await goalService.generateGoal(userId, 'Daily', analytics);
      goals.push(newGoal);
    }

    // Dynamic AI Suggestion (Template-based)
    let aiSuggestion = "Keep listening to discover more about your habits!";
    if (habits.length > 0) {
      aiSuggestion = `Based on your listening, you're close to becoming a ${habits[0].habit}. Keep it up!`;
    }

    // Mocking current streak (this would come from Analytics/User model)
    const currentStreak = 12;

    // Get today's snapshot for accurate daily count and sync time
    const today = new Date();
    today.setHours(0,0,0,0);
    const dailySnapshots = await analyticsRepository.getSnapshots(userId, 'daily', today, new Date());
    const todaySnapshot = dailySnapshots.length > 0 ? dailySnapshots[0] : null;

    const songsToday = todaySnapshot?.listening?.totalSongs || 0;
    const lastSyncedAt = todaySnapshot?.generatedAt || null;

    return {
      streak: currentStreak,
      goals,
      habits,
      aiSuggestion,
      songsToday,
      lastSyncedAt
    };
  },

  async getListeningCalendar(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 168); // 24 weeks * 7 days

    const snapshots = await analyticsRepository.getSnapshots(userId, 'daily', sixMonthsAgo, new Date());
    
    // Map snapshots to a calendar format of exactly 168 days
    const calendar = [];
    for (let i = 168; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i + 1);
      date.setHours(0, 0, 0, 0);

      const snap = snapshots.find(s => {
        const snapDate = new Date(s.periodStart);
        return snapDate.getDate() === date.getDate() && snapDate.getMonth() === date.getMonth() && snapDate.getFullYear() === date.getFullYear();
      });

      calendar.push({
        date: date,
        count: snap?.listening?.totalSongs || 0,
        minutes: snap?.listening ? Math.round((snap.listening.totalMs || 0) / 60000) : 0
      });
    }

    return calendar;
  }
};
