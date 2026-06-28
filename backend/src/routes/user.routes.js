import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.get('/profile', userController.getProfile);
router.patch('/sync', userController.syncProfile);

export default router;
