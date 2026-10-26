const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, 'Please provide group name'],
      trim: true,
      minlength: [3, 'Group name must be at least 3 characters long']
    },
    // Academic Interest: Java, Python, Data Structures, DBMS, Operating Systems, Computer Networks, Web Development, AI
    subject: {
      type: String,
      required: [true, 'Please provide subject/topic'],
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    semester: {
      type: String,
      default: 'S3',
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide group description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    maxMembers: {
      type: Number,
      default: 8,
      min: [2, 'A study group must allow at least 2 members'],
      max: [50, 'A study group cannot exceed 50 members']
    }
  },
  {
    timestamps: true
  }
);

groupSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

module.exports = mongoose.model('Group', groupSchema);
