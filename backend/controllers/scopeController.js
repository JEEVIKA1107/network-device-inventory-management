const NetworkScope = require('../models/NetworkScope');

// @desc    Get all network scopes
// @route   GET /api/scopes
// @access  Private
exports.getScopes = async (req, res, next) => {
  try {
    const scopes = await NetworkScope.find().sort({ isDefault: -1, name: 1 });
    res.status(200).json({
      success: true,
      count: scopes.length,
      scopes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a network scope
// @route   POST /api/scopes
// @access  Private (Admin)
exports.createScope = async (req, res, next) => {
  try {
    const { name, cidr, description, isDefault } = req.body;

    if (!name || !cidr) {
      return res.status(400).json({
        success: false,
        message: 'Scope name and CIDR are required'
      });
    }

    if (isDefault) {
      await NetworkScope.updateMany({}, { isDefault: false });
    }

    const scope = await NetworkScope.create({
      name,
      cidr,
      description: description || '',
      isDefault: Boolean(isDefault)
    });

    res.status(201).json({
      success: true,
      message: 'Network scope created successfully',
      scope
    });
  } catch (error) {
    next(error);
  }
};
