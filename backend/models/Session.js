const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Please provide session study topic'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide session date']
    },
    time: {
      type: String,
      required: [true, 'Please provide session time (e.g. 18:00 or 6:00 PM)'],
      trim: true
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Session must belong to a study group']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Session', sessionSchema);
