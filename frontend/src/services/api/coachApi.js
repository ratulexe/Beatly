import { api } from '../apiClient';

export const coachApi = {
  getDashboard: () => api.get('/api/coach'),
  getGoals: () => api.get('/api/coach/goals'),
  completeGoal: (goalId, progressDelta) => api.post('/api/coach/goals/complete', { goalId, progressDelta }),
  getChallenges: () => api.get('/api/coach/challenges'),
  getHabits: () => api.get('/api/coach/habits'),
  getCalendar: () => api.get('/api/coach/calendar')
};
