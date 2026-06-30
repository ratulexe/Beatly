import { Challenge } from '../../models/Challenge.model.js';
export const challengeService = {
  async getActiveChallenges(userId) {
    const now = new Date();
    // Global challenges + specific group challenges
    let challenges = await Challenge.find({
      $or: [
        { isGlobal: true },
        // { groupId: { $in: userGroups } } // Would need group integration
      ],
      endDate: { $gt: now }
    });

    return challenges;
  },

  async joinChallenge(userId, challengeId) {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const participantExists = challenge.participants.find(p => p.userId.toString() === userId.toString());
    if (participantExists) return challenge;

    challenge.participants.push({ userId, progress: 0, completed: false });
    await challenge.save();
    return challenge;
  },

  async generateGlobalChallenge(title, description, category, frequency, target, unit, durationDays) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const challenge = new Challenge({
      title,
      description,
      category,
      frequency,
      target,
      unit,
      startDate,
      endDate,
      isGlobal: true
    });

    await challenge.save();
    return challenge;
  }
};
