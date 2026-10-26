const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ['PERSONAL', 'GROUP'],
      required: [true, 'Chat type must be PERSONAL or GROUP'],
      default: 'PERSONAL'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Message must have a sender']
    },
    // Required for PERSONAL chat
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    // Required for GROUP chat
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachment: {
      name: { type: String, default: '' },
      fileType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      dataUrl: { type: String, default: '' }
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Validate that message either contains text content or an attachment
messageSchema.pre('validate', function (next) {
  const hasText = this.message && this.message.trim().length > 0;
  const hasAttachment = this.attachment && this.attachment.dataUrl && this.attachment.name;
  if (!hasText && !hasAttachment) {
    next(new Error('A message must contain text or an attachment.'));
  } else {
    next();
  }
});

// Indexes for fast lookup of conversation histories
messageSchema.index({ chatType: 1, sender: 1, recipient: 1, createdAt: 1 });
messageSchema.index({ chatType: 1, groupId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
