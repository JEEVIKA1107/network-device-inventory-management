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

router.get('/check-duplicate', protect, checkDuplicateIP);

router
  .route('/')
  .get(protect, getDevices)
  .post(protect, authorize('Admin', 'Faculty / IT Staff'), createDevice);

router
  .route('/:id')
  .get(protect, getDeviceById)
  .put(protect, authorize('Admin', 'Faculty / IT Staff'), updateDevice)
  .delete(protect, authorize('Admin'), deleteDevice);

module.exports = router;
