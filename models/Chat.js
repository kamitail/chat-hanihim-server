const mongoose = require('mongoose');

const Chat = new mongoose.Schema({
  name: { type: String },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  created_at: { type: Date, required: true, default: new Date() },
  is_group: { type: Boolean, required: true },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  ],
  managers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  is_locked: { type: Boolean, default: false },
  image: { type: String },
  description: { type: String }
});

module.exports = mongoose.model('Chat', Chat);