const mongoose = require('mongoose');

const networkScopeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scope name is required'],
      trim: true,
      unique: true
    },
    cidr: {
      type: String,
      required: [true, 'CIDR block is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('NetworkScope', networkScopeSchema);
