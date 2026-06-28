import express from 'express';
import { spotifyAuth } from '../middlewares/spotifyAuth.js';
import * as InvitationController from '../controllers/invitation.controller.js';

const router = express.Router();

router.use(spotifyAuth);

router.get('/', InvitationController.getInvitations);
router.post('/', InvitationController.sendInvitation);
router.patch('/:invitationId', InvitationController.respondToInvitation);

export default router;
