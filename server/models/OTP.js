const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Automatically delete document when expiresAt is reached
  },
  verified: {
    type: Boolean,
    default: false,
  },
  purpose: {
    type: String,
    enum: ['verification', 'password_reset'],
    default: 'verification',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OTPSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model('OTP', OTPSchema);
