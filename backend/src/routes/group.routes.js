import express from 'express';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import * as GroupController from '../controllers/group.controller.js';

const router = express.Router();

router.use(spotifyAuth);

router.post('/', GroupController.createGroup);
router.get('/:groupId', GroupController.getGroup);
router.patch('/:groupId', GroupController.updateGroup);
router.delete('/:groupId', GroupController.deleteGroup);
router.delete('/:groupId/members/:userId', GroupController.removeMember);

export default router;
