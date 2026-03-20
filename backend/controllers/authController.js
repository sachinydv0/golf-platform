const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// @desc   Register user
// @route  POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, password, charityId, contributionPercent } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      charity: {
        charityId: charityId || null,
        contributionPercent: contributionPercent || 10,
      },
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('charity.charityId', 'name logo slug');
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update profile
// @route  PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, charityId, contributionPercent } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (charityId) user.charity.charityId = charityId;
    if (contributionPercent) user.charity.contributionPercent = contributionPercent;
    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sanitizeUser = (user) => ({
  _id:          user._id,
  firstName:    user.firstName,
  lastName:     user.lastName,
  email:        user.email,
  role:         user.role,
  avatar:       user.avatar,
  subscription: user.subscription,
  scores:       user.scores,
  charity:      user.charity,
  drawsEntered: user.drawsEntered,
  totalWinnings:user.totalWinnings,
  createdAt:    user.createdAt,
});
