const Device = require('../models/Device');
const NetworkScope = require('../models/NetworkScope');
const NetworkConnection = require('../models/NetworkConnection');
const ActivityLog = require('../models/ActivityLog');
const ValidationHistory = require('../models/ValidationHistory');
const { validateIPv4Address } = require('../automata/dfaEngine');

// Helper to generate a unique Device ID based on device type
const generateUniqueDeviceId = async (deviceType) => {
  const prefixMap = {
    Router: 'ROU',
    Switch: 'SWI',
    Computer: 'PC',
    Server: 'SRV',
    Printer: 'PRN',
    'Wireless Access Point': 'WAP'
  };
  const prefix = prefixMap[deviceType] || 'DEV';
  const count = await Device.countDocuments({ deviceType });
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  let candidate = `DEV-${prefix}-${String(count + 1).padStart(3, '0')}`;

  // Ensure collision-free
  const exists = await Device.findOne({ deviceId: candidate });
  if (exists) {
    candidate = `DEV-${prefix}-${randomSuffix}`;
  }
  return candidate;
};

// @desc    Get all devices with search, filtering, sorting, pagination
// @route   GET /api/devices
// @access  Private
exports.getDevices = async (req, res, next) => {
  try {
    const {
      search,
      deviceType,
      connectionStatus,
      department,
      laboratory,
      networkScopeId,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Filter by type
    if (deviceType && deviceType !== 'ALL') {
      query.deviceType = deviceType;
    }

    // Filter by status
    if (connectionStatus && connectionStatus !== 'ALL') {
      query.connectionStatus = connectionStatus;
    }

    // Filter by department
    if (department && department !== 'ALL') {
      query.department = department;
    }

    // Filter by laboratory
    if (laboratory && laboratory !== 'ALL') {
      query.laboratory = laboratory;
    }

    // Filter by scope
    if (networkScopeId && networkScopeId !== 'ALL') {
      query.networkScopeId = networkScopeId;
    }

    // Search query across name, deviceId, IP, MAC
    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { deviceName: { $regex: s, $options: 'i' } },
        { deviceId: { $regex: s, $options: 'i' } },
        { ipAddress: { $regex: s, $options: 'i' } },
        { macAddress: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Device.countDocuments(query);
    const devices = await Device.find(query)
      .populate('networkScopeId', 'name cidr')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: devices.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      devices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single device by ID
// @route   GET /api/devices/:id
// @access  Private
exports.getDeviceById = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id).populate('networkScopeId', 'name cidr');
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Fetch related connections
    const connections = await NetworkConnection.find({
      $or: [{ sourceDeviceId: device._id }, { targetDeviceId: device._id }]
    })
      .populate('sourceDeviceId', 'deviceName deviceId ipAddress deviceType connectionStatus')
      .populate('targetDeviceId', 'deviceName deviceId ipAddress deviceType connectionStatus');

    res.status(200).json({
      success: true,
      device,
      connections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check duplicate IP within network scope
// @route   GET /api/devices/check-duplicate
// @access  Private
exports.checkDuplicateIP = async (req, res, next) => {
  try {
    const { ip, scopeId, excludeDeviceId } = req.query;

    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address query param required' });
    }

    const query = { ipAddress: ip.trim() };
    if (scopeId) {
      query.networkScopeId = scopeId;
    }
    if (excludeDeviceId) {
      query._id = { $ne: excludeDeviceId };
    }

    const existingDevice = await Device.findOne(query).populate('networkScopeId', 'name cidr');

    if (existingDevice) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: `IP Address ${ip} is already assigned to active device '${existingDevice.deviceName}' (${existingDevice.deviceId})`,
        conflictingDevice: {
          id: existingDevice._id,
          deviceId: existingDevice.deviceId,
          deviceName: existingDevice.deviceName,
          deviceType: existingDevice.deviceType,
          location: existingDevice.location,
          networkScope: existingDevice.networkScopeId?.name || 'Default Scope'
        }
      });
    }

    return res.status(200).json({
      success: true,
      isDuplicate: false,
      message: 'IP address is available in this network scope'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new network device
// @route   POST /api/devices
// @access  Private (Admin, Faculty / IT Staff)
exports.createDevice = async (req, res, next) => {
  try {
    const {
      deviceId,
      deviceName,
      deviceType,
      ipAddress,
      macAddress,
      department,
      building,
      laboratory,
      location,
      manufacturer,
      model,
      networkScopeId,
      connectionStatus,
      description
    } = req.body;

    // 1. Validate IPv4 address format through DFA & Regex
    const ipCheck = validateIPv4Address(ipAddress);
    if (!ipCheck.isValid) {
      // Record failed validation attempt
      await ValidationHistory.create({
        inputAddress: ipAddress || 'EMPTY',
        isValid: false,
        regexMatch: ipCheck.regexMatch,
        dfaAccepted: ipCheck.dfaAccepted,
        errorMessage: ipCheck.errorReason,
        validationMethod: 'DFA and Regex Hybrid',
        invalidOctet: ipCheck.invalidOctet,
        finalState: ipCheck.finalState,
        totalSteps: ipCheck.totalSteps,
        validatedBy: req.user ? req.user._id : null
      });

      return res.status(400).json({
        success: false,
        message: `Invalid IPv4 Address: ${ipCheck.errorReason}`,
        ipValidation: ipCheck
      });
    }

    // 2. Detect duplicate IP within same network scope
    const duplicateQuery = { ipAddress: ipAddress.trim() };
    if (networkScopeId) {
      duplicateQuery.networkScopeId = networkScopeId;
    }

    const existingDevice = await Device.findOne(duplicateQuery);
    if (existingDevice) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `Duplicate IP Address detected: '${ipAddress}' is already assigned to '${existingDevice.deviceName}' (${existingDevice.deviceId}) in this network scope.`,
        conflictingDevice: {
          id: existingDevice._id,
          deviceId: existingDevice.deviceId,
          deviceName: existingDevice.deviceName,
          location: existingDevice.location
        }
      });
    }

    // 3. Auto-generate Device ID if empty or verify uniqueness
    let finalDeviceId = deviceId ? deviceId.trim().toUpperCase() : await generateUniqueDeviceId(deviceType);
    const existingId = await Device.findOne({ deviceId: finalDeviceId });
    if (existingId) {
      finalDeviceId = await generateUniqueDeviceId(deviceType);
    }

    // 4. Create Device record
    const device = await Device.create({
      deviceId: finalDeviceId,
      deviceName,
      deviceType,
      ipAddress: ipAddress.trim(),
      macAddress: macAddress ? macAddress.trim().toUpperCase() : '',
      department: department || 'Information Technology',
      building: building || 'Main Academic Block',
      laboratory: laboratory || 'Central Computing Facility',
      location: location || 'Rack 1',
      manufacturer: manufacturer || 'Cisco / Generic',
      model: model || 'Standard Edition',
      networkScopeId: networkScopeId || null,
      connectionStatus: connectionStatus || 'Unknown',
      description: description || ''
    });

    // 5. Record successful validation history
    await ValidationHistory.create({
      inputAddress: ipAddress.trim(),
      isValid: true,
      regexMatch: true,
      dfaAccepted: true,
      errorMessage: null,
      validationMethod: 'DFA and Regex Hybrid',
      finalState: ipCheck.finalState,
      totalSteps: ipCheck.totalSteps,
      validatedBy: req.user ? req.user._id : null
    });

    // 6. Log Activity
    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      userRole: req.user ? req.user.role : 'System',
      action: 'DEVICE_CREATE',
      description: `Registered new ${deviceType} '${deviceName}' (${finalDeviceId}) with IP ${ipAddress}`,
      targetId: device._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      device
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private (Admin, Faculty / IT Staff)
exports.updateDevice = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    const { ipAddress, networkScopeId } = req.body;

    // If IP address is being modified, validate & check duplicate
    if (ipAddress && ipAddress.trim() !== device.ipAddress) {
      const ipCheck = validateIPv4Address(ipAddress);
      if (!ipCheck.isValid) {
        return res.status(400).json({
          success: false,
          message: `Invalid IPv4 Address: ${ipCheck.errorReason}`,
          ipValidation: ipCheck
        });
      }

      const dupQuery = {
        _id: { $ne: device._id },
        ipAddress: ipAddress.trim()
      };
      if (networkScopeId || device.networkScopeId) {
        dupQuery.networkScopeId = networkScopeId || device.networkScopeId;
      }

      const conflict = await Device.findOne(dupQuery);
      if (conflict) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: `IP conflict: '${ipAddress}' is currently in use by '${conflict.deviceName}' (${conflict.deviceId})`,
          conflictingDevice: conflict
        });
      }
    }

    // Update fields
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'System',
      userRole: req.user ? req.user.role : 'System',
      action: 'DEVICE_UPDATE',
      description: `Updated device '${updatedDevice.deviceName}' (${updatedDevice.deviceId})`,
      targetId: updatedDevice._id.toString()
    });

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      device: updatedDevice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete device
// @route   DELETE /api/devices/:id
// @access  Private (Admin only)
exports.deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    // Cascade delete connections
    await NetworkConnection.deleteMany({
      $or: [{ sourceDeviceId: device._id }, { targetDeviceId: device._id }]
    });

    await device.deleteOne();

    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
      userRole: req.user ? req.user.role : 'Admin',
      action: 'DEVICE_DELETE',
      description: `Deleted device '${device.deviceName}' (${device.deviceId})`,
      targetId: device._id.toString()
    });

    res.status(200).json({
      success: true,
      message: `Device ${device.deviceId} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
