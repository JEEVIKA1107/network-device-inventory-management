const ValidationHistory = require('../models/ValidationHistory');
const {
  validateIPv4Address,
  simulateIPv4DFA,
  getAutomataMetadata
} = require('../automata/dfaEngine');

// @desc    Validate an IPv4 address string using DFA & Regex
// @route   POST /api/validation/ipv4
// @access  Public / Authenticated
exports.validateIP = async (req, res, next) => {
  try {
    const { ipAddress } = req.body;

    if (!ipAddress && ipAddress !== '') {
      return res.status(400).json({
        success: false,
        message: 'IP address string is required in request body'
      });
    }

    const result = validateIPv4Address(ipAddress);

    // Save record to MongoDB ValidationHistory
    const historyDoc = await ValidationHistory.create({
      inputAddress: ipAddress,
      isValid: result.isValid,
      regexMatch: result.regexMatch,
      dfaAccepted: result.dfaAccepted,
      errorMessage: result.errorReason,
      validationMethod: 'DFA and Regex Hybrid',
      invalidOctet: result.invalidOctet,
      finalState: result.finalState,
      totalSteps: result.totalSteps,
      validatedBy: req.user ? req.user._id : null
    });

    res.status(200).json({
      success: true,
      validation: {
        ...result,
        historyId: historyDoc._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Execute DFA step-by-step simulator for an input string
// @route   POST /api/validation/dfa/simulate
// @access  Public / Authenticated
exports.simulateDFA = async (req, res, next) => {
  try {
    const { ipAddress } = req.body;

    if (typeof ipAddress !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid string required for simulation'
      });
    }

    const simulation = simulateIPv4DFA(ipAddress);

    res.status(200).json({
      success: true,
      simulation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get validation history from MongoDB
// @route   GET /api/validation/history
// @access  Private
exports.getValidationHistory = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status === 'valid') query.isValid = true;
    if (status === 'invalid') query.isValid = false;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await ValidationHistory.countDocuments(query);
    const history = await ValidationHistory.find(query)
      .populate('validatedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get formal automata metadata, state machine info, table, diagram
// @route   GET /api/validation/dfa/metadata
// @access  Public / Authenticated
exports.getAutomataMetadata = async (req, res, next) => {
  try {
    const metadata = getAutomataMetadata();
    res.status(200).json({
      success: true,
      metadata
    });
  } catch (error) {
    next(error);
  }
};
