
const express = require('express');
const router = express.Router();

const {
  checkDeviceConnectivity,
  getMonitoringStatus,
  getDeviceConnectivityHistory,
  checkAllDevices
} = require('../controllers/monitoringController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All logged-in users can view monitoring information
router.get('/status', protect, getMonitoringStatus);
router.get('/history/:deviceId', protect, getDeviceConnectivityHistory);

// Only Admin can run connectivity checks
router.post('/check/:deviceId', protect, authorize('Admin'), checkDeviceConnectivity);
router.post('/check-all', protect, authorize('Admin'), checkAllDevices);

module.exports = router;
