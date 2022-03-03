const express = require('express');
const router = express.Router();
const User = require('../models/User');

const getRecentChatDate = (chat) =>
  chat.messages.length
    ? chat.messages[chat.messages.length - 1].sent_at
    : chat.created_at;

const sortChats = (chats) => {
  chats.forEach((chat) => { chat.messages.sort((a, b) => a.sent_at - b.sent_at) });
  chats.sort((chatA, chatB) => getRecentChatDate(chatB) - getRecentChatDate(chatA));
};

router.get('/', async (req, res, next) => {
  try {
    const allUsers = await User.find().lean();
    allUsers.sort((a, b) => {
      const firstName = `${a.firstname} ${a.lastname}`;
      const secondName = `${b.firstname} ${b.lastname}`;
      return firstName.toLowerCase() > secondName.toLowerCase() ? 1 : -1;
    });
    res.send(allUsers);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('/email/:email', async (req, res, next) => {
  try {
    const userByEmail = await User.findOne({ 'email': req.params.email });
    res.send(userByEmail);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('/id/:id', async (req, res, next) => {
  try {
    const userById = await User.findById(req.params.id);
    res.send(userById);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('/chats/:id', async (req, res, next) => {
  try {
    const allChatsByUserId = await User
      .findById(req.params.id)
      .select('chats -_id')
      .populate('chats')
      .populate({
        path: 'chats',
        populate: {
          path: 'messages',
          populate: {
            path: 'sent_by',
            select: 'firstname lastname image is_online last_seen'
          }
        }
      })
      .populate({
        path: 'chats',
        populate: {
          path: 'members',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .lean();
    sortChats(allChatsByUserId.chats);
    res.send(allChatsByUserId);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('/chats/newMessages/:id', async (req, res, next) => {
  try {
    const allChatsByUserId = await User
      .findById(req.params.id)
      .select('chats -_id')
      .populate('chats')
      .populate({
        path: 'chats',
        populate: {
          path: 'messages',
        }
      })
      .lean();
    sortChats(allChatsByUserId.chats);
    const newMessages = allChatsByUserId.chats.map((chat) =>
      chat.messages.reduce((acc, message) =>
        !message.users_seen.some((user) => user == req.params.id)
          ? acc + 1 : acc, 0));
    res.send(newMessages);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.get('chats/shared/:id/:currUserId')

router.post('/add', async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    res.send(newUser);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const userByEmailPasssword = await User.findOne(req.body);
    res.send(userByEmailPasssword);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/online', async (req, res) => {
  try {
    const onlineUserChats = await User.findByIdAndUpdate(req.body.id,
      {
        $set: {
          is_online: req.body.isOnline,
          last_seen: req.body.lastSeen
        }
      }, { new: true }).select('chats -_id')
      .populate('chats')
      .populate({
        path: 'chats',
        populate: {
          path: 'messages',
          populate: {
            path: 'sent_by',
            select: 'firstname lastname image is_online last_seen'
          }
        }
      })
      .populate({
        path: 'chats',
        populate: {
          path: 'members',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .lean();
    res.send(onlineUserChats);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/update/:id', async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(updatedUser);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/edit', async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body.id, {
      $set: {
        phone_number: req.body.phone_number,
        image: req.body.image,
        status: req.body.status
      }
    }, { new: true })
      .select('chats -_id')
      .populate('chats')
      .populate({
        path: 'chats',
        populate: {
          path: 'messages',
          populate: {
            path: 'sent_by',
            select: 'firstname lastname image is_online last_seen'
          }
        }
      })
      .populate({
        path: 'chats',
        populate: {
          path: 'members',
          select: 'firstname lastname image is_online last_seen'
        }
      })
      .lean();
    sortChats(updatedUser.chats);;
    res.send(updatedUser);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.put('/edit/password', async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.body.id, {
      $set: { password: req.body.password }
    }, { new: true }).lean();
    res.send(updatedUser);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

module.exports = router;
