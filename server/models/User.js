const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true, // Allows null/undefined while maintaining uniqueness for non-null values
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
    // Note: unique + sparse is set via index below to handle null values properly
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
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
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

  whatsappNumber: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
