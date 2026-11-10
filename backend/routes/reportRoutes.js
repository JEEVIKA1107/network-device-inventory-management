const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAnalytics,
  exportDevicesCSV
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardSummary);
router.get('/analytics', protect, getAnalytics);
router.get('/export/devices', protect, exportDevicesCSV);

module.exports = router;
