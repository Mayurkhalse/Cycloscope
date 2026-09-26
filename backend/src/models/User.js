const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['meteorologist', 'analyst', 'coordinator', 'admin'],
      default: 'meteorologist',
      index: true,
    },
    roleTitle: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    station: {
      type: String,
      required: true,
    },
    callsign: {
      type: String,
      required: true,
      unique: true,
    },
    clearanceLevel: {
      type: String,
      required: true,
    },
    capabilities: [
      {
        type: String,
      },
    ],
    avatarInitials: {
      type: String,
      default: 'OP',
    },
    badgeColor: {
      type: String,
      default: 'emerald',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
