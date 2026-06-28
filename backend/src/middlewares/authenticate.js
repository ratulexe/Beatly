import { User } from '../../database/index.js';

export const authenticate = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No active session' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      // If session has a userId but it doesn't exist in DB anymore
      req.session.destroy();
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    req.user = user; // Attach user to request for downstream handlers
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};
