const mongoose = require('mongoose');

const validationHistorySchema = new mongoose.Schema(
  {
    inputAddress: {
      type: String,
      required: true,
      trim: true
    },
    isValid: {
      type: Boolean,
      required: true
    },
    regexMatch: {
      type: Boolean,
      default: false
    },
    dfaAccepted: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: null
    },
    validationMethod: {
      type: String,
      enum: ['DFA and Regex Hybrid', 'DFA Engine', 'Canonical Regex'],
      default: 'DFA and Regex Hybrid'
    },
    invalidOctet: {
      type: Number,
      default: null
    },
    finalState: {
      type: String,
      default: 'TRAP_DEAD'
    },
    totalSteps: {
      type: Number,
      default: 0
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ValidationHistory', validationHistorySchema);
