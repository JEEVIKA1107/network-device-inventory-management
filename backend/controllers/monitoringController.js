const net = require('net');
const Device = require('../models/Device');
const ConnectivityHistory = require('../models/ConnectivityHistory');
const ActivityLog = require('../models/ActivityLog');
const { CANONICAL_IPV4_REGEX } = require('../automata/automataBuilder');

// Helper to check if IP is in private RFC 1918 range
const isPrivateIP = (ip) => {
  const parts = ip.split('.').map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true; // loopback
  return false;
};

// Check if running on cloud platform without direct LAN access
const isCloudEnvironment = () => {
  return (
    process.env.RENDER ||
    process.env.VERCEL ||
    process.env.IS_CLOUD_DEPLOYMENT === 'true'
  );
};

// Safe TCP socket ping helper with timeout
const testHostReachability = (ip, port = 80, timeoutMs = 2000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    let resolved = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        const responseTime = Date.now() - startTime;
        cleanup();
        resolve({ reachable: true, responseTime, message: 'Host reached successfully' });
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ reachable: false, responseTime: timeoutMs, message: 'Connection timed out' });
      }
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        const responseTime = Date.now() - startTime;
        cleanup();
        // If connection is refused (ECONNREFUSED), the remote host TCP stack responded!
        // That means the machine is alive and connected on the network!
        if (err.code === 'ECONNREFUSED') {
          resolve({ reachable: true, responseTime, message: 'Host is online (Port closed / RST received)' });
        } else {
          resolve({ reachable: false, responseTime, message: `Unreachable: ${err.code || err.message}` });
        }
      }
    });

    try {
      socket.connect(port, ip);
    } catch (e) {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ reachable: false, responseTime: 0, message: e.message });
      }
    }
  });
};

// @desc    Perform connectivity check on a registered device
// @route   POST /api/monitoring/check/:deviceId
// @access  Private (Admin, Faculty / IT Staff)
exports.checkDeviceConnectivity = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.deviceId);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const ip = device.ipAddress;

    // Strict validation check
    if (!CANONICAL_IPV4_REGEX.test(ip)) {
      return res.status(400).json({
        success: false,
        message: 'Device has invalid IPv4 configuration'
      });
    }

    const isPrivate = isPrivateIP(ip);
    const inCloud = isCloudEnvironment();

    let status = 'Unknown';
    let responseTime = 0;
    let errorMessage = null;

    if (inCloud && isPrivate) {
      status = 'Unknown';
      errorMessage = 'Cloud deployment (Render/Vercel) cannot route to private college LAN without a local agent';
    } else {
      // Choose probe port: for public DNS/web or default port 80 / 53
      const probePort = ip === '8.8.8.8' || ip === '1.1.1.1' ? 53 : 80;
      const timeout = parseInt(process.env.NETWORK_CHECK_TIMEOUT_MS, 10) || 2000;

      const result = await testHostReachability(ip, probePort, timeout);

      if (result.reachable) {
        status = 'Online';
        responseTime = result.responseTime;
        device.lastSeenAt = new Date();
      } else {
        status = 'Offline';
        responseTime = result.responseTime;
        errorMessage = result.message;
      }
    }

    // Update device status and timestamp
    device.connectionStatus = status;
    device.lastCheckedAt = new Date();
    await device.save();

    // Store in ConnectivityHistory
    const hist = await ConnectivityHistory.create({
      deviceId: device._id,
      deviceIp: ip,
      status,
      responseTime,
      errorMessage,
      checkedAt: new Date(),
      checkedBy: req.user ? req.user._id : null
    });

    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      userRole: req.user ? req.user.role : 'System',
      action: 'CONNECTIVITY_CHECK',
      description: `Checked connectivity for '${device.deviceName}' (${ip}): Status ${status} (${responseTime}ms)`,
      targetId: device._id.toString()
    });

    res.status(200).json({
      success: true,
      result: {
        deviceId: device._id,
        deviceName: device.deviceName,
        ipAddress: ip,
        status,
        responseTime,
        errorMessage,
        lastCheckedAt: device.lastCheckedAt,
        historyId: hist._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall monitoring status
// @route   GET /api/monitoring/status
// @access  Private
exports.getMonitoringStatus = async (req, res, next) => {
  try {
    const totalDevices = await Device.countDocuments();
    const onlineCount = await Device.countDocuments({ connectionStatus: 'Online' });
    const offlineCount = await Device.countDocuments({ connectionStatus: 'Offline' });
    const unknownCount = await Device.countDocuments({ connectionStatus: 'Unknown' });

    const recentChecks = await ConnectivityHistory.find()
      .populate('deviceId', 'deviceName deviceId deviceType ipAddress location')
      .sort({ checkedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      metrics: {
        totalDevices,
        onlineCount,
        offlineCount,
        unknownCount,
        healthPercentage: totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 0,
        isCloudEnvironment: isCloudEnvironment()
      },
      recentChecks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get device connectivity history
// @route   GET /api/monitoring/history/:deviceId
// @access  Private
exports.getDeviceConnectivityHistory = async (req, res, next) => {
  try {
    const history = await ConnectivityHistory.find({ deviceId: req.params.deviceId })
      .sort({ checkedAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch check all registered devices
// @route   POST /api/monitoring/check-all
// @access  Private (Admin only)
exports.checkAllDevices = async (req, res, next) => {
  try {
    const devices = await Device.find().limit(50); // limit to protect network
    const results = [];

    for (const dev of devices) {
      const probePort = dev.ipAddress === '8.8.8.8' ? 53 : 80;
      const resProbe = await testHostReachability(dev.ipAddress, probePort, 1500);

      const status = resProbe.reachable ? 'Online' : 'Offline';
      dev.connectionStatus = status;
      dev.lastCheckedAt = new Date();
      if (status === 'Online') dev.lastSeenAt = new Date();
      await dev.save();

      await ConnectivityHistory.create({
        deviceId: dev._id,
        deviceIp: dev.ipAddress,
        status,
        responseTime: resProbe.responseTime,
        errorMessage: resProbe.message,
        checkedAt: new Date(),
        checkedBy: req.user ? req.user._id : null
      });

      results.push({
        deviceId: dev.deviceId,
        deviceName: dev.deviceName,
        ipAddress: dev.ipAddress,
        status,
        responseTime: resProbe.responseTime
      });
    }

    res.status(200).json({
      success: true,
      message: `Batch check executed for ${devices.length} devices`,
      results
    });
  } catch (error) {
    next(error);
  }
};
