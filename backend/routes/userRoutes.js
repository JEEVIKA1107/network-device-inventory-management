const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin'), getUsers);
router.put('/:id', protect, authorize('Admin'), updateUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
