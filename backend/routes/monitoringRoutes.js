const express = require('express');
const router = express.Router();
const {
  checkDeviceConnectivity,
  getMonitoringStatus,
  getDeviceConnectivityHistory,
  checkAllDevices
} = require('../controllers/monitoringController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/status', protect, getMonitoringStatus);
router.post('/check/:deviceId', protect, authorize('Admin', 'Faculty / IT Staff'), checkDeviceConnectivity);
router.post('/check-all', protect, authorize('Admin'), checkAllDevices);
router.get('/history/:deviceId', protect, getDeviceConnectivityHistory);

module.exports = router;
