const mongoose = require('mongoose');

const networkConnectionSchema = new mongoose.Schema(
  {
    sourceDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    targetDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true
    },
    connectionType: {
      type: String,
      enum: ['Ethernet', 'Fiber', 'Wireless', 'Uplink'],
      default: 'Ethernet'
    },
    bandwidth: {
      type: String,
      default: '1 Gbps'
    },
    port: {
      type: String,
      default: 'eth0'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('NetworkConnection', networkConnectionSchema);
