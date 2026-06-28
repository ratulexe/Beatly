import * as FriendService from '../services/group/friend.service.js';

export const sendRequest = async (req, res) => {
  try {
    const request = await FriendService.sendFriendRequest(req.user._id, req.body.receiverId);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const request = await FriendService.respondToFriendRequest(
      req.params.requestId,
      req.user._id,
      req.body.status
    );
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    await FriendService.removeFriend(req.user._id, req.params.friendId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const friends = await FriendService.getFriends(req.user._id);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
