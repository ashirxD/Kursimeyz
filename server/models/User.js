const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    // unique: true // intentionally not unique globally if we want to link accounts, but for now simple
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true, 
  },

  phone: {
    type: String,
    unique: true,
    trim: true,
  },

  username: {
    type: String,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

module.exports = mongoose.model('User', UserSchema);
