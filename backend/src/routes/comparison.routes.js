import express from 'express';
import { comparisonController } from '../controllers/comparison.controller.js';
import { spotifyAuth as protect } from '../middlewares/spotifyAuth.js';

const router = express.Router();

router.use(protect);

router.post('/', comparisonController.compareUsers);

export default router;
