const express = require('express');
const router = express.Router();
const { getScopes, createScope } = require('../controllers/scopeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getScopes);
router.post('/', protect, authorize('Admin'), createScope);

module.exports = router;
