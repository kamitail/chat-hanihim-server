const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const router = express.Router();

const sortMessages = (messages) => {
  messages.sort((messageA, messageB) => messageA.sent_at - messageB.sent_at);
};

router.get('/users/:id', async (req, res, next) => {
  try {
    const allUsersByChatId = await Chat
      .findById(req.params.id)
      .select('members -_id')
      .populate('members');
    res.send(allUsersByChatId);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('/messages/:id', async (req, res, next) => {
  try {
    const allMessagesByChatId = await Chat
      .findById(req.params.id)
      .select('messages -_id')
      .populate('messages')
      .lean();
    sortMessages(allMessagesByChatId.messages);
    res.send(allMessagesByChatId);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post('/add', async (req, res, next) => {
  try {
    const newChat = await Chat.create(req.body);
    await User.updateMany({ '_id': { '$in': newChat.members } },
      { '$addToSet': { 'chats': newChat._id } });
    res.send(await Chat.findById(newChat._id).populate({
      path: 'messages',
      populate: {
        path: 'sent_by',
        select: 'firstname lastname image is_online last_seen'
      }
    })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean());
  } catch (error) {
    res.sendStatus(404);
  }
});

router.patch('/leave/:id/:userId', async (req, res, next) => {
  try {
    let updatedChat = await Chat.findByIdAndUpdate(req.params.id,
      { '$pull': { members: req.params.userId } }, { new: true }).lean();
    const updatedUser = await User.findByIdAndUpdate(req.params.userId,
      { '$pull': { chats: req.params.id } }, { new: true }).lean();
    updatedChat = await Chat.findByIdAndUpdate(req.params.id,
      { '$pull': { managers: req.params.userId } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();

    if (!updatedChat.managers.length && updatedChat.members.length) {
      const newManager =
        updatedChat.members.some((member) => member._id == updatedChat.created_by)
          ? updatedChat.created_by
          : updatedChat.members[Math.floor(Math.random() * updatedChat.members.length)]._id;
      updatedChat = await Chat.findByIdAndUpdate(req.params.id,
        { '$push': { managers: newManager } }, { new: true }).populate({
          path: 'messages',
          populate: {
            path: 'sent_by',
            select: 'firstname lastname image is_online last_seen'
          }
        })
        .populate({
          path: 'members',
          select: 'firstname lastname image is_online last_seen'
        }).lean();
    }

    res.send({ updatedChat, updatedUser });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.patch('/promote/:id/:userId', async (req, res, next) => {
  try {
    const chatWithPromotion = await Chat.findByIdAndUpdate(req.params.id,
      { '$push': { managers: req.params.userId } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();
    res.send(chatWithPromotion);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.patch('/lock/:id/:isLocked', async (req, res, next) => {
  try {
    const lockedChat = await Chat.findByIdAndUpdate(req.params.id,
      { '$set': { is_locked: req.params.isLocked } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();
    res.send(lockedChat);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/image/:id', async (req, res, next) => {
  try {
    const newImageChat = await Chat.findByIdAndUpdate(req.params.id,
      { '$set': { image: req.body.image } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();
    res.send(newImageChat);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/desc/:id', async (req, res, next) => {
  try {
    const newDescChat = await Chat.findByIdAndUpdate(req.params.id,
      { '$set': { description: req.body.description } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();
    res.send(newDescChat);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/users/add/:id', async (req, res, next) => {
  try {
    const newMembersChat = await Chat.findByIdAndUpdate(req.params.id,
      { $push: { members: req.body.members } }, { new: true }).populate({
        path: 'messages',
        populate: {
          path: 'sent_by',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .populate({
        path: 'members',
        select: 'firstname lastname image is_online last_seen'
      }).lean();
    await User.updateMany({ _id: { $in: req.body.members } },
      { $push: { chats: req.params.id } });
    res.send(newMembersChat);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const deletedChat = await Chat.findByIdAndRemove(req.params.id);
    await Message.remove({ _id: { $in: deletedChat.messages } });
    res.send();
  } catch (error) {
    res.status(404).send(error.message);
  }
});

module.exports = router;
