const mongoose = require('mongoose');

const User = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, trim: true },
  phone_number: { type: String, required: true, trim: true },
  birthdate: { type: Date, required: true },
  password: { type: String, required: true, minlength: 6 },
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    }
  ],
  image: {
    type: String,
    required: true,
    default: 'https://i.pinimg.com/originals/10/91/94/1091948c6b80b65b9eef8c163f0ae42a.jpg'
  },
  is_online: { type: Boolean, required: true, default: false },
  last_seen: { type: Date, required: true, default: new Date() },
  status: { type: String, required: true, default: 'Hi there, I am using Chat Hanihim!' }
});

module.exports = mongoose.model('User', User);