const User = require('../models/User');

// @desc   Add a new score (enforces rolling 5)
// @route  POST /api/scores
exports.addScore = async (req, res) => {
  const { value, date } = req.body;

  if (!value || value < 1 || value > 45) {
    return res.status(400).json({ success: false, message: 'Score must be between 1 and 45 (Stableford)' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.addScore(Number(value), date ? new Date(date) : new Date());
    await user.save();
    res.json({ success: true, scores: user.scores, message: 'Score added. Showing latest 5.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get user scores
// @route  GET /api/scores
exports.getScores = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('scores');
    // Sort by date descending (most recent first)
    const sorted = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, scores: sorted, count: sorted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Edit a specific score entry
// @route  PUT /api/scores/:scoreId
exports.editScore = async (req, res) => {
  const { value, date } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const score = user.scores.id(req.params.scoreId);
    if (!score) return res.status(404).json({ success: false, message: 'Score not found' });

    if (value) {
      if (value < 1 || value > 45) return res.status(400).json({ success: false, message: 'Score must be 1–45' });
      score.value = Number(value);
    }
    if (date) score.date = new Date(date);

    await user.save();
    res.json({ success: true, scores: user.scores.sort((a, b) => new Date(b.date) - new Date(a.date)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete a specific score entry
// @route  DELETE /api/scores/:scoreId
exports.deleteScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const before = user.scores.length;
    user.scores = user.scores.filter(s => s._id.toString() !== req.params.scoreId);
    if (user.scores.length === before) return res.status(404).json({ success: false, message: 'Score not found' });
    await user.save();
    res.json({ success: true, scores: user.scores, message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
