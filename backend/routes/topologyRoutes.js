const express = require('express');
const router = express.Router();
const {
  getTopology,
  addConnection,
  deleteConnection
} = require('../controllers/topologyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTopology);
router.post('/connections', protect, authorize('Admin', 'Faculty / IT Staff'), addConnection);
router.delete('/connections/:id', protect, authorize('Admin', 'Faculty / IT Staff'), deleteConnection);

module.exports = router;
