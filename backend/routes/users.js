const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc   Get own full profile
// @route  GET /api/users/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('charity.charityId', 'name logo slug shortDesc');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc   Update charity selection
// @route  PUT /api/users/charity
router.put('/charity', protect, async (req, res) => {
  const { charityId, contributionPercent } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (charityId) user.charity.charityId = charityId;
    if (contributionPercent >= 10) user.charity.contributionPercent = contributionPercent;
    await user.save();
    await user.populate('charity.charityId', 'name logo slug');
    res.json({ success: true, charity: user.charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
