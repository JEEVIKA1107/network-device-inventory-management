const mongoose = require('mongoose');

const connectivityHistorySchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    deviceIp: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Online', 'Offline', 'Unknown'],
      required: true
    },
    responseTime: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: null
    },
    checkedAt: {
      type: Date,
      default: Date.now
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ConnectivityHistory', connectivityHistorySchema);
