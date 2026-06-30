import mongoose from 'mongoose';
import { ListeningHistory } from './src/database/index.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const dayStart = new Date('2026-06-29T00:00:00+05:30');
  const dayEnd = new Date('2026-06-29T23:59:59+05:30');
  const count = await ListeningHistory.countDocuments({
    playedAt: { $gte: dayStart, $lte: dayEnd }
  });
  console.log('Tracks in DB for June 29 IST:', count);
  
  const yestStart = new Date('2026-06-28T00:00:00+05:30');
  const yestEnd = new Date('2026-06-28T23:59:59+05:30');
  const count2 = await ListeningHistory.countDocuments({
    playedAt: { $gte: yestStart, $lte: yestEnd }
  });
  console.log('Tracks in DB for June 28 IST:', count2);
  
  process.exit(0);
}).catch(console.error);
