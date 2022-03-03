const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const router = express.Router();

router.post('/add', async (req, res, next) => {
    try {
        const newMessage = await Message.create(req.body);
        const updatedChat = await Chat.findOneAndUpdate({ '_id': newMessage.chat },
            { '$addToSet': { 'messages': newMessage._id }, }, { new: true })
            .populate({
                path: 'messages',
                populate: {
                    path: 'sent_by',
                    select: 'firstname lastname image is_online last_seen'
                }
            })
            .populate({
                path: 'members',
                select: 'firstname lastname image is_online last_seen'
            });
        res.send(updatedChat);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

router.patch('/update/:chatId/:userId', async (req, res, next) => {
    try {
        const chatMessages = await Chat.findById(req.params.chatId).select('messages -_id');
        const updatedMessages = await Message.updateMany(
            { '_id': { '$in': chatMessages.messages } },
            { '$addToSet': { 'users_seen': req.params.userId } });
        res.send(await Chat.findById(req.params.chatId).populate({
            path: 'messages',
            populate: {
                path: 'sent_by',
                select: 'firstname lastname image is_online last_seen'
            }
        })
            .populate({
                path: 'members',
                select: 'firstname lastname image is_online last_seen'
            })
            .lean());
    } catch (error) {
        res.status(404).send(error.message);
    }
});

router.delete('/delete/:id', async (req, res, next) => {
    try {
        const deletedMessage = await Message.findByIdAndRemove(req.params.id);
        const chatWithoutMessage = await Chat.findByIdAndUpdate(deletedMessage.chat,
            { $pull: { messages: req.params.id } }, { new: true }).populate({
                path: 'messages',
                populate: {
                    path: 'sent_by',
                    select: 'firstname lastname image is_online last_seen'
                }
            })
            .populate({
                path: 'members',
                select: 'firstname lastname image is_online last_seen'
            })
            .lean();
        res.send(chatWithoutMessage);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;
