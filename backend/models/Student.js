const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    // Personal Details
    name: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Please provide student email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },

    // Academic Details
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    year: {
      type: String,
      default: '2nd Year',
      trim: true
    },
    semester: {
      type: String,
      default: 'S3',
      trim: true
    },

    // Academic Interests: Java, Python, Data Structures, DBMS, Operating Systems, Computer Networks, Web Development, AI
    academicInterests: {
      type: [String],
      default: []
    },

    // Personal Interests: Gaming, Music, Sports, Fitness, Reading, Photography, Travel
    personalInterests: {
      type: [String],
      default: []
    },

    // Learning Preferences: Group Discussion, Problem Solving, Exam Preparation
    learningPreferences: {
      type: [String],
      default: ['Group Discussion', 'Problem Solving']
    },

    // Legacy / Convenience aliases for backwards compatibility
    subjects: {
      type: [String],
      default: []
    },
    interests: {
      type: [String],
      default: []
    },
    availability: {
      type: String,
      default: 'Evenings 6 PM - 9 PM'
    },
    learningPreference: {
      type: String,
      default: 'Group Discussion'
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

// Sync legacy fields with new fields on save
studentSchema.pre('save', async function (next) {
  // Sync academicInterests and subjects
  if (this.academicInterests && this.academicInterests.length > 0) {
    this.subjects = this.academicInterests;
  } else if (this.subjects && this.subjects.length > 0) {
    this.academicInterests = this.subjects;
  }

  // Sync personalInterests and interests
  if (this.personalInterests && this.personalInterests.length > 0) {
    this.interests = this.personalInterests;
  } else if (this.interests && this.interests.length > 0) {
    this.personalInterests = this.interests;
  }

  // Sync learningPreferences
  if (this.learningPreferences && this.learningPreferences.length > 0) {
    this.learningPreference = this.learningPreferences.join(', ');
  }

  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
