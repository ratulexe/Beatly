import express from 'express';
import * as wrappedController from '../controllers/wrapped.controller.js';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';

const router = express.Router();

router.use(spotifyAuth);

// GET / - maybe return recent wrapped?
router.get('/', wrappedController.getArchive);

router.post('/generate', wrappedController.generate);
router.get('/archive', wrappedController.getArchive);
router.get('/compare', wrappedController.getCompare);
router.get('/:id', wrappedController.getReport);
router.post('/share', wrappedController.share);

export default router;
