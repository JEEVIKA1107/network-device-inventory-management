const Device = require('../models/Device');
const ValidationHistory = require('../models/ValidationHistory');
const ConnectivityHistory = require('../models/ConnectivityHistory');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get aggregate metrics for Admin Dashboard
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalDevices,
      activeDevices,
      inactiveDevices,
      unknownDevices,
      routers,
      switches,
      computers,
      servers,
      printers,
      accessPoints,
      validIpValidations,
      invalidIpValidations,
      recentActivities,
      recentConnectivityLogs
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ connectionStatus: 'Online' }),
      Device.countDocuments({ connectionStatus: 'Offline' }),
      Device.countDocuments({ connectionStatus: 'Unknown' }),
      Device.countDocuments({ deviceType: 'Router' }),
      Device.countDocuments({ deviceType: 'Switch' }),
      Device.countDocuments({ deviceType: 'Computer' }),
      Device.countDocuments({ deviceType: 'Server' }),
      Device.countDocuments({ deviceType: 'Printer' }),
      Device.countDocuments({ deviceType: 'Wireless Access Point' }),
      ValidationHistory.countDocuments({ isValid: true }),
      ValidationHistory.countDocuments({ isValid: false }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(8),
      ConnectivityHistory.find()
        .populate('deviceId', 'deviceName deviceId deviceType ipAddress')
        .sort({ checkedAt: -1 })
        .limit(8)
    ]);

    // Compute duplicate IP occurrences in database if any
    const duplicateAggregation = await Device.aggregate([
      {
        $group: {
          _id: { ipAddress: '$ipAddress', scope: '$networkScopeId' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    const duplicateIPConflicts = duplicateAggregation.length;

    // Monthly / Weekly registration activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrationActivity = await Device.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalDevices,
        activeDevices,
        inactiveDevices,
        unknownDevices,
        routers,
        switches,
        computers,
        servers,
        printers,
        accessPoints,
        validIpValidations,
        invalidIpValidations,
        duplicateIPConflicts
      },
      charts: {
        categoryDistribution: {
          labels: ['Router', 'Switch', 'Computer', 'Server', 'Printer', 'Access Point'],
          data: [routers, switches, computers, servers, printers, accessPoints]
        },
        connectionStatusDistribution: {
          labels: ['Online', 'Offline', 'Unknown'],
          data: [activeDevices, inactiveDevices, unknownDevices]
        },
        registrationActivity
      },
      recentActivities,
      recentConnectivityLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics and breakdown by department & laboratory
// @route   GET /api/reports/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const { department, deviceType, status, startDate, endDate } = req.query;
    const filter = {};

    if (department && department !== 'ALL') filter.department = department;
    if (deviceType && deviceType !== 'ALL') filter.deviceType = deviceType;
    if (status && status !== 'ALL') filter.connectionStatus = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Breakdown by department
    const departmentBreakdown = await Device.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          online: {
            $sum: { $cond: [{ $eq: ['$connectionStatus', 'Online'] }, 1, 0] }
          },
          offline: {
            $sum: { $cond: [{ $eq: ['$connectionStatus', 'Offline'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Breakdown by laboratory
    const laboratoryBreakdown = await Device.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$laboratory',
          building: { $first: '$building' },
          total: { $sum: 1 },
          online: {
            $sum: { $cond: [{ $eq: ['$connectionStatus', 'Online'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Breakdown by device type
    const typeBreakdown = await Device.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      departmentBreakdown,
      laboratoryBreakdown,
      typeBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export inventory as CSV
// @route   GET /api/reports/export/devices
// @access  Private
exports.exportDevicesCSV = async (req, res, next) => {
  try {
    const devices = await Device.find().populate('networkScopeId', 'name cidr');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=NetTrack_Device_Inventory_${Date.now()}.csv`
    );

    let csv = 'Device ID,Device Name,Device Type,IPv4 Address,MAC Address,Department,Building,Laboratory,Location,Status,Scope,Registered Date\n';

    devices.forEach((d) => {
      const row = [
        `"${d.deviceId || ''}"`,
        `"${d.deviceName || ''}"`,
        `"${d.deviceType || ''}"`,
        `"${d.ipAddress || ''}"`,
        `"${d.macAddress || ''}"`,
        `"${d.department || ''}"`,
        `"${d.building || ''}"`,
        `"${d.laboratory || ''}"`,
        `"${d.location || ''}"`,
        `"${d.connectionStatus || 'Unknown'}"`,
        `"${d.networkScopeId?.name || 'Default Scope'}"`,
        `"${new Date(d.createdAt).toISOString()}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
