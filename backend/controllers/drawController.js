const Draw = require('../models/Draw');
const User = require('../models/User');
const drawEngine = require('../services/drawEngine');
const emailService = require('../services/emailService');

// @desc   Get all draws (paginated)
// @route  GET /api/draws
exports.getDraws = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const total = await Draw.countDocuments({ status: 'published' });
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-winners');
    res.json({ success: true, draws, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single draw by id (public)
// @route  GET /api/draws/:id
exports.getDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id).populate('winners.userId', 'firstName lastName email');
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, draw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current month's draw status
// @route  GET /api/draws/current
exports.getCurrentDraw = async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    const draw  = await Draw.findOne({ month, year });
    res.json({ success: true, draw: draw || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get user's draw history + winnings
// @route  GET /api/draws/my
exports.getMyDraws = async (req, res) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.userId': req.user._id,
    }).sort({ year: -1, month: -1 });

    const participations = await Draw.countDocuments({
      status: 'published',
      $expr: { $gte: [{ $toDate: '$createdAt' }, req.user.createdAt] },
    });

    res.json({ success: true, draws, participations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// @desc   Simulate a draw (preview, not published)
// @route  POST /api/draws/simulate (admin)
exports.simulateDraw = async (req, res) => {
  const { month, year, drawType, algoMode } = req.body;
  try {
    // Get last jackpot carry
    const lastDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });
    const carryForward = lastDraw && lastDraw.pool && !lastDraw.winners.some(w => w.matchType === '5-match')
      ? lastDraw.pool.jackpot : 0;

    const drawNumbers = drawType === 'algorithmic'
      ? await drawEngine.algorithmicDraw(algoMode || 'most')
      : drawEngine.randomDraw();

    const pool = await drawEngine.calculatePrizePools(carryForward);
    const winnerGroups = await drawEngine.findWinners(drawNumbers);
    const winners = drawEngine.buildWinnerDocs(winnerGroups, pool);
    const participants = await User.countDocuments({ 'subscription.status': 'active' });

    res.json({
      success: true,
      simulation: {
        month, year, drawNumbers, drawType, pool, winners,
        totalParticipants: participants,
        jackpotWon: winnerGroups.fiveMatch.length > 0,
        carryForward,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create & publish a draw
// @route  POST /api/draws/publish (admin)
exports.publishDraw = async (req, res) => {
  const { month, year, drawType, drawNumbers, algoMode } = req.body;
  try {
    const existing = await Draw.findOne({ month, year });
    if (existing && existing.status === 'published') {
      return res.status(400).json({ success: false, message: 'Draw for this month already published' });
    }

    const lastDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });
    const carryForward = lastDraw && !lastDraw.winners.some(w => w.matchType === '5-match')
      ? lastDraw.pool.jackpot : 0;

    const finalNumbers = drawNumbers || (
      drawType === 'algorithmic'
        ? await drawEngine.algorithmicDraw(algoMode)
        : drawEngine.randomDraw()
    );

    const pool = await drawEngine.calculatePrizePools(carryForward);
    const winnerGroups = await drawEngine.findWinners(finalNumbers);
    const winners = drawEngine.buildWinnerDocs(winnerGroups, pool);
    const participants = await User.countDocuments({ 'subscription.status': 'active' });

    const draw = existing || new Draw({ month, year });
    draw.drawNumbers      = finalNumbers;
    draw.drawType         = drawType || 'random';
    draw.pool             = pool;
    draw.winners          = winners;
    draw.totalParticipants= participants;
    draw.status           = 'published';
    draw.publishedAt      = new Date();

    await draw.save();

    // Update user drawsEntered and totalWinnings
    await User.updateMany({ 'subscription.status': 'active' }, { $inc: { drawsEntered: 1 } });
    for (const w of winners) {
      await User.findByIdAndUpdate(w.userId, { $inc: { totalWinnings: w.prizeAmount } });
    }

    // Send winner notifications
    await emailService.sendDrawResults(draw);

    res.json({ success: true, draw, message: `Draw for ${month}/${year} published successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all draws for admin (includes unpublished)
// @route  GET /api/draws/admin/all
exports.adminGetDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ year: -1, month: -1 }).populate('winners.userId', 'firstName lastName email');
    res.json({ success: true, draws });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
