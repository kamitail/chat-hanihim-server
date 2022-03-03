const mongoose = require('mongoose');

const Message = new mongoose.Schema({
  content: { type: String, required: true },
  users_seen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  sent_at: { type: Date, required: true, default: new Date() },
  sent_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  original_message: {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sender_name: {type: String},
    content: {type: String}
  }
});

module.exports = mongoose.model('Message', Message);