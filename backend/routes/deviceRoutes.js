
const express = require('express');
const router = express.Router();

const {
  getDevices,
  getDeviceById,
  checkDuplicateIP,
  createDevice,
  updateDevice,
  deleteDevice
} = require('../controllers/deviceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All logged-in users can check duplicate IPs
router.get('/check-duplicate', protect, checkDuplicateIP);

// All logged-in users can view devices.
// Only Admin can add devices.
router
  .route('/')
  .get(protect, getDevices)
  .post(protect, authorize('Admin'), createDevice);

// All logged-in users can view device details.
// Only Admin can edit or delete devices.
router
  .route('/:id')
  .get(protect, getDeviceById)
  .put(protect, authorize('Admin'), updateDevice)
  .delete(protect, authorize('Admin'), deleteDevice);

module.exports = router;
