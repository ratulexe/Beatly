import express from 'express';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import * as FriendController from '../controllers/friend.controller.js';

const router = express.Router();

router.use(spotifyAuth);

router.get('/', FriendController.getFriends);
router.post('/request', FriendController.sendRequest);
router.patch('/request/:requestId', FriendController.respondToRequest);
router.delete('/:friendId', FriendController.removeFriend);

export default router;
