const Device = require('../models/Device');
const NetworkConnection = require('../models/NetworkConnection');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get complete network topology (nodes & edges)
// @route   GET /api/topology
// @access  Private
exports.getTopology = async (req, res, next) => {
  try {
    const devices = await Device.find()
      .populate('networkScopeId', 'name cidr')
      .sort({ deviceType: 1 });

    const connections = await NetworkConnection.find()
      .populate('sourceDeviceId', 'deviceId deviceName deviceType ipAddress connectionStatus')
      .populate('targetDeviceId', 'deviceId deviceName deviceType ipAddress connectionStatus');

    // Build hierarchical/graph structure
    const nodes = devices.map((d) => ({
      id: d._id.toString(),
      deviceId: d.deviceId,
      name: d.deviceName,
      type: d.deviceType,
      ip: d.ipAddress,
      mac: d.macAddress,
      status: d.connectionStatus,
      location: `${d.building} - ${d.laboratory}`,
      department: d.department,
      scope: d.networkScopeId?.name || 'Default Scope'
    }));

    const edges = connections
      .filter((c) => c.sourceDeviceId && c.targetDeviceId)
      .map((c) => ({
        id: c._id.toString(),
        source: c.sourceDeviceId._id.toString(),
        sourceName: c.sourceDeviceId.deviceName,
        sourceType: c.sourceDeviceId.deviceType,
        target: c.targetDeviceId._id.toString(),
        targetName: c.targetDeviceId.deviceName,
        targetType: c.targetDeviceId.deviceType,
        type: c.connectionType,
        bandwidth: c.bandwidth,
        port: c.port
      }));

    res.status(200).json({
      success: true,
      nodes,
      edges,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a network connection link
// @route   POST /api/topology/connections
// @access  Private (Admin, Faculty / IT Staff)
exports.addConnection = async (req, res, next) => {
  try {
    const { sourceDeviceId, targetDeviceId, connectionType, bandwidth, port } = req.body;

    if (!sourceDeviceId || !targetDeviceId) {
      return res.status(400).json({
        success: false,
        message: 'Both sourceDeviceId and targetDeviceId are required'
      });
    }

    if (sourceDeviceId === targetDeviceId) {
      return res.status(400).json({
        success: false,
        message: 'A device cannot establish a connection to itself'
      });
    }

    // Verify both devices exist
    const [source, target] = await Promise.all([
      Device.findById(sourceDeviceId),
      Device.findById(targetDeviceId)
    ]);

    if (!source || !target) {
      return res.status(404).json({
        success: false,
        message: 'One or both devices not found'
      });
    }

    // Check if connection already exists in either direction
    const existing = await NetworkConnection.findOne({
      $or: [
        { sourceDeviceId, targetDeviceId },
        { sourceDeviceId: targetDeviceId, targetDeviceId: sourceDeviceId }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A network connection between these two devices already exists'
      });
    }

    const connection = await NetworkConnection.create({
      sourceDeviceId,
      targetDeviceId,
      connectionType: connectionType || 'Ethernet',
      bandwidth: bandwidth || '1 Gbps',
      port: port || 'Port-01'
    });

    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      userRole: req.user ? req.user.role : 'System',
      action: 'TOPOLOGY_CONNECT',
      description: `Linked '${source.deviceName}' to '${target.deviceName}' via ${connection.connectionType}`,
      targetId: connection._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Connection created successfully',
      connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a network connection
// @route   DELETE /api/topology/connections/:id
// @access  Private (Admin, Faculty / IT Staff)
exports.deleteConnection = async (req, res, next) => {
  try {
    const connection = await NetworkConnection.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    await connection.deleteOne();

    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      userRole: req.user ? req.user.role : 'System',
      action: 'TOPOLOGY_DISCONNECT',
      description: 'Removed network link between devices',
      targetId: req.params.id
    });

    res.status(200).json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
