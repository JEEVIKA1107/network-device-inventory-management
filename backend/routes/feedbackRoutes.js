const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  submitFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// Any logged-in user can submit feedback
router.post('/', protect, submitFeedback);

// Only Admin can view all feedback
router.get('/', protect, authorize('Admin'), getAllFeedback);

// Only Admin can update feedback
router.put('/:id', protect, authorize('Admin'), updateFeedback);

// Only Admin can delete feedback
router.delete('/:id', protect, authorize('Admin'), deleteFeedback);

module.exports = router;