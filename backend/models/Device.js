const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true
    },
    deviceType: {
      type: String,
      required: [true, 'Device type is required'],
      enum: [
        'Router',
        'Switch',
        'Computer',
        'Server',
        'Printer',
        'Wireless Access Point'
      ]
    },
    ipAddress: {
      type: String,
      required: [true, 'IPv4 address is required'],
      trim: true
    },
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    building: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true
    },
    laboratory: {
      type: String,
      required: [true, 'Laboratory / Room is required'],
      trim: true
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Lab'
    },
    manufacturer: {
      type: String,
      trim: true,
      default: 'Generic'
    },
    model: {
      type: String,
      trim: true,
      default: 'Standard'
    },
    networkScopeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NetworkScope',
      required: false
    },
    connectionStatus: {
      type: String,
      enum: ['Online', 'Offline', 'Unknown'],
      default: 'Unknown'
    },
    lastCheckedAt: {
      type: Date,
      default: null
    },
    lastSeenAt: {
      type: Date,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for fast duplicate IP searches scoped to network scope
deviceSchema.index({ ipAddress: 1, networkScopeId: 1 }, { unique: false });

module.exports = mongoose.model('Device', deviceSchema);
