import * as GroupService from '../services/group/group.service.js';

export const createGroup = async (req, res) => {
  try {
    const group = await GroupService.createGroup(req.body, req.user._id);
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const groups = await GroupService.getUserGroups(req.user._id);
    res.status(200).json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await GroupService.getGroupById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.status(200).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await GroupService.updateGroup(req.params.groupId, req.body, req.user._id);
    res.status(200).json(group);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    await GroupService.deleteGroup(req.params.groupId, req.user._id);
    res.status(204).send();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const group = await GroupService.removeMember(req.params.groupId, req.params.userId, req.user._id);
    res.status(200).json(group);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};
