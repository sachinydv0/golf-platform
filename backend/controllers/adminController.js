const User    = require('../models/User');
const Draw    = require('../models/Draw');
const Charity = require('../models/Charity');
const Payment = require('../models/Payment');

// @desc   Get dashboard analytics
// @route  GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalCharities, draws, payments] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      Charity.countDocuments({ isActive: true }),
      Draw.find({ status: 'published' }).sort({ year: -1, month: -1 }).limit(6),
      Payment.find({ status: 'succeeded' }),
    ]);

    const totalRevenue     = payments.reduce((s, p) => s + p.amount, 0) / 100;
    const totalCharityPool = payments.reduce((s, p) => s + p.charityAmount, 0) / 100;
    const totalPrizePool   = payments.reduce((s, p) => s + p.prizePoolAmount, 0) / 100;

    const monthlyRevenue = {};
    payments.forEach(p => {
      const key = `${new Date(p.createdAt).getFullYear()}-${String(new Date(p.createdAt).getMonth()+1).padStart(2,'0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount / 100;
    });

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 }).limit(5)
      .select('firstName lastName email subscription.status subscription.plan createdAt');

    res.json({
      success: true,
      analytics: {
        totalUsers, activeUsers, totalCharities,
        totalRevenue, totalCharityPool, totalPrizePool,
        recentUsers, monthlyRevenue,
        drawStats: draws.map(d => ({
          label:        `${d.month}/${d.year}`,
          participants: d.totalParticipants,
          prizePool:    d.pool.total,
          winners:      d.winners.length,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all users
// @route  GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const filter = { role: 'user' };
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];
    if (status) filter['subscription.status'] = status;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('charity.charityId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single user (admin)
// @route  GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('charity.charityId', 'name logo')
      .select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update user (admin can edit profile + scores + subscription)
// @route  PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'email', 'scores', 'subscription', 'charity'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Cancel / reactivate user subscription (admin)
// @route  PUT /api/admin/users/:id/subscription
exports.manageSubscription = async (req, res) => {
  const { action } = req.body; // 'cancel' | 'reactivate'
  try {
    const user   = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const subId  = user.subscription.stripeSubscriptionId;

    if (action === 'cancel' && subId) {
      await stripe.subscriptions.cancel(subId);
      user.subscription.status = 'cancelled';
    } else if (action === 'reactivate' && subId) {
      await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
      user.subscription.status = 'active';
    }
    await user.save();
    res.json({ success: true, message: `Subscription ${action}d`, subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all payments
// @route  GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
