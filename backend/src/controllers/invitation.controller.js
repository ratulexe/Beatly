import * as InvitationService from '../services/group/invitation.service.js';

export const sendInvitation = async (req, res) => {
  try {
    const { receiverId, groupId } = req.body;
    const invitation = await InvitationService.sendGroupInvitation(req.user._id, receiverId, groupId);
    res.status(201).json(invitation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const invitation = await InvitationService.respondToInvitation(
      req.params.invitationId,
      req.user._id,
      req.body.status
    );
    res.status(200).json(invitation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
