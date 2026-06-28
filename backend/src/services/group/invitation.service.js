import { Invitation } from '../../models/Invitation.model.js';
import { Group } from '../../models/Group.model.js';
import crypto from 'crypto';
import { createNotification } from './notification.service.js';
import { addMember } from './group.service.js';

export const sendGroupInvitation = async (senderId, receiverId, groupId) => {
  const group = await Group.findOne({ _id: groupId, admins: senderId });
  if (!group) throw new Error('Group not found or unauthorized');

  const existingInvite = await Invitation.findOne({
    sender: senderId,
    receiver: receiverId,
    group: groupId,
    status: 'pending'
  });

  if (existingInvite) throw new Error('Invitation already sent');

  const invitation = new Invitation({
    sender: senderId,
    receiver: receiverId,
    group: groupId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  await invitation.save();

  await createNotification({
    user: receiverId,
    type: 'group_invite',
    title: 'New Group Invitation',
    message: `You have been invited to join ${group.name}.`,
    relatedId: invitation._id,
    onModel: 'Invitation'
  });

  return invitation;
};

export const respondToInvitation = async (invitationId, receiverId, status) => {
  const invitation = await Invitation.findOne({ _id: invitationId, receiver: receiverId });
  if (!invitation) throw new Error('Invitation not found or unauthorized');
  
  if (invitation.expiresAt < new Date()) {
    invitation.status = 'expired';
    await invitation.save();
    throw new Error('Invitation has expired');
  }

  invitation.status = status;
  await invitation.save();

  if (status === 'accepted') {
    await addMember(invitation.group, receiverId);
  }

  return invitation;
};
