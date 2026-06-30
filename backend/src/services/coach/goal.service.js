import { Goal } from '../../models/Goal.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load templates
const loadTemplates = (filename) => {
  const filePath = path.join(__dirname, 'templates', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const templates = [
  ...loadTemplates('listening.json'),
  ...loadTemplates('genres.json'),
  ...loadTemplates('artists.json'),
  ...loadTemplates('albums.json'),
  ...loadTemplates('social.json')
];

export const goalService = {
  async getActiveGoals(userId) {
    return Goal.find({ userId, completed: false, deadline: { $gt: new Date() } });
  },

  async generateGoal(userId, frequency, analyticsData) {
    // 1. Filter templates by frequency
    const available = templates.filter(t => t.frequency.includes(frequency));
    
    // 2. Select a random template
    const template = available[Math.floor(Math.random() * available.length)];

    // 3. Set deadline
    const deadline = new Date();
    if (frequency === 'Daily') deadline.setHours(23, 59, 59, 999);
    if (frequency === 'Weekly') deadline.setDate(deadline.getDate() + (7 - deadline.getDay()));
    if (frequency === 'Monthly') deadline.setMonth(deadline.getMonth() + 1, 0);

    // 4. Generate a lightweight reason from the selected goal template.
    let aiReason = `This ${frequency.toLowerCase()} goal aligns with your recent listening patterns.`;
    if (template.category === 'Listening Time') {
      aiReason = `Based on your recent listening, reaching ${template.target} ${template.unit} will push your average up.`;
    }

    const newGoal = new Goal({
      userId,
      title: template.title,
      category: template.category,
      frequency,
      target: template.target,
      unit: template.unit,
      difficulty: template.difficulty,
      aiReason,
      deadline
    });

    await newGoal.save();
    return newGoal;
  },

  async updateProgress(userId, goalId, progressDelta) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) throw new Error('Goal not found');
    if (goal.completed) return goal;

    goal.progress += progressDelta;
    if (goal.progress >= goal.target) {
      goal.progress = goal.target;
      goal.completed = true;
      // In Sprint 7, call rewardService to grant XP
    }
    
    await goal.save();
    return goal;
  }
};
