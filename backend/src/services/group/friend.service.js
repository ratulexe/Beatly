import { FriendRequest } from '../../models/FriendRequest.model.js';
import { User } from '../../models/User.model.js';
import { createNotification } from './notification.service.js';

export const sendFriendRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) throw new Error('Cannot send request to yourself');

  const existingRequest = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId
  });

  if (existingRequest) {
    if (existingRequest.status === 'pending') throw new Error('Request already pending');
    if (existingRequest.status === 'accepted') throw new Error('Already friends');
    existingRequest.status = 'pending';
    await existingRequest.save();
    return existingRequest;
  }

  const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
  await newRequest.save();

  await createNotification({
    user: receiverId,
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'You have a new friend request.',
    relatedId: newRequest._id,
    onModel: 'FriendRequest'
  });

  return newRequest;
};

export const respondToFriendRequest = async (requestId, receiverId, status) => {
  const request = await FriendRequest.findOne({ _id: requestId, receiver: receiverId });
  if (!request) throw new Error('Friend request not found or unauthorized');

  if (status === 'accepted') {
    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
    await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
  }

  request.status = status;
  await request.save();
  return request;
};

export const removeFriend = async (userId, friendId) => {
  await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
  await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
  
  await FriendRequest.findOneAndDelete({
    $or: [
      { sender: userId, receiver: friendId },
      { sender: friendId, receiver: userId }
    ]
  });
};

export const getFriends = async (userId) => {
  const user = await User.findById(userId).populate('friends', 'displayName profileImage spotifyId');
  return user ? user.friends : [];
};
