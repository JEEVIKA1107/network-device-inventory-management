
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// Submit feedback
// POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { category, message, rating } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your feedback.'
      });
    }

    const validCategories = [
      'General',
      'Bug Report',
      'Feature Request',
      'Network Performance'
    ];

    const selectedCategory = category || 'General';

    if (!validCategories.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback category.'
      });
    }

    if (
      rating !== undefined &&
      rating !== null &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    const feedback = await Feedback.create({
      submittedBy: req.user._id,
      category: selectedCategory,
      message: message.trim(),
      rating: rating === undefined || rating === null
        ? null
        : Number(rating)
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to submit feedback.'
    });
  }
};


// Get all feedback
// GET /api/feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('submittedBy', 'name email role')
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });

  } catch (error) {
    console.error('Get feedback error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve feedback.'
    });
  }
};


// Update feedback status and admin reply
// PUT /api/feedback/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID.'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    if (status !== undefined) {
      const validStatuses = ['New', 'In Review', 'Resolved'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid feedback status.'
        });
      }

      feedback.status = status;
    }

    if (adminReply !== undefined) {
      if (typeof adminReply !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Admin reply must be text.'
        });
      }

      feedback.adminReply = adminReply.trim();
      feedback.repliedBy = req.user._id;
      feedback.repliedAt = new Date();
    }

    await feedback.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback updated successfully.',
      feedback
    });

  } catch (error) {
    console.error('Update feedback error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update feedback.'
    });
  }
};


// Delete feedback
// DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID.'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    await feedback.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete feedback.'
    });
  }
};
