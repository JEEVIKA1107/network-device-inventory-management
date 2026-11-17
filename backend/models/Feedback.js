
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        'General',
        'Bug Report',
        'Feature Request',
        'Network Performance'
      ],
      default: 'General'
    },

    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: 2000
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    status: {
      type: String,
      enum: ['New', 'In Review', 'Resolved'],
      default: 'New'
    },

    adminReply: {
      type: String,
      trim: true,
      default: ''
    },

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    repliedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
