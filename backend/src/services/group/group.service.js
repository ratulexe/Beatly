import { Group } from '../../models/Group.model.js';

export const createGroup = async (groupData, userId) => {
  const group = new Group({
    ...groupData,
    createdBy: userId,
    admins: [userId],
    members: [userId]
  });
  return await group.save();
};

export const getGroupById = async (groupId) => {
  return await Group.findById(groupId).populate('members admins createdBy');
};

export const updateGroup = async (groupId, updateData, userId) => {
  const group = await Group.findOne({ _id: groupId, admins: userId });
  if (!group) throw new Error('Group not found or unauthorized');
  
  Object.assign(group, updateData);
  return await group.save();
};

export const deleteGroup = async (groupId, userId) => {
  const group = await Group.findOneAndDelete({ _id: groupId, createdBy: userId });
  if (!group) throw new Error('Group not found or unauthorized');
  return group;
};

export const addMember = async (groupId, userId) => {
  return await Group.findByIdAndUpdate(
    groupId, 
    { $addToSet: { members: userId } },
    { new: true }
  );
};

export const removeMember = async (groupId, targetUserId, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');
  
  // Can remove themselves, or admin can remove
  if (targetUserId !== requesterId && !group.admins.includes(requesterId)) {
    throw new Error('Unauthorized');
  }
  
  group.members.pull(targetUserId);
  group.admins.pull(targetUserId); // in case they were admin
  return await group.save();
};
