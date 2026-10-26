const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Notification'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'GROUP_UPDATE',
        'SESSION',
        'SESSION_REMINDER',
        'PARTNER_MATCH',
        'JOIN_REQUEST',
        'MEMBER_JOINED',
        'JOIN',
        'INVITATION',
        'WELCOME',
        'GENERAL'
      ],
      default: 'GENERAL'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
