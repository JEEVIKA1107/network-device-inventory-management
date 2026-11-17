
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe
} = require('../controllers/authController');

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

// Only Admin can register new users
router.post('/register', protect, authorize('Admin'), register);

// Users can log in
router.post('/login', login);

// Logged-in users can view their own profile
router.get('/me', protect, getMe);

module.exports = router;
