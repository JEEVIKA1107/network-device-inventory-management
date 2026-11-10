const express = require('express');
const router = express.Router();
const {
  validateIP,
  simulateDFA,
  getValidationHistory,
  getAutomataMetadata
} = require('../controllers/validationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ipv4', validateIP);
router.post('/dfa/simulate', simulateDFA);
router.get('/dfa/metadata', getAutomataMetadata);
router.get('/history', protect, getValidationHistory);

module.exports = router;
