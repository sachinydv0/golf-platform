const Draw   = require('../models/Draw');
const User   = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc   Upload winner proof screenshot
// @route  POST /api/winners/:drawId/proof
exports.uploadProof = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    const winner = draw.winners.find(w => w.userId.toString() === req.user._id.toString());
    if (!winner) return res.status(403).json({ success: false, message: 'You are not a winner in this draw' });

    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a proof image' });

    winner.proofUrl       = req.file.path; // Cloudinary URL set by multer-storage-cloudinary
    winner.paymentStatus  = 'pending';
    await draw.save();

    res.json({ success: true, message: 'Proof uploaded. Awaiting admin review.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all winners awaiting verification (admin)
// @route  GET /api/winners/pending
exports.getPendingWinners = async (req, res) => {
  try {
    const draws = await Draw.find({
      'winners.paymentStatus': 'pending',
      'winners.proofUrl':      { $ne: '' },
    }).populate('winners.userId', 'firstName lastName email');

    const pending = [];
    draws.forEach(draw => {
      draw.winners.filter(w => w.paymentStatus === 'pending' && w.proofUrl).forEach(w => {
        pending.push({
          drawId:    draw._id,
          drawMonth: draw.month,
          drawYear:  draw.year,
          winner:    w,
        });
      });
    });

    res.json({ success: true, pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Verify or reject a winner (admin)
// @route  PUT /api/winners/:drawId/:winnerId
exports.verifyWinner = async (req, res) => {
  const { action, note } = req.body; // action: 'approve' | 'reject'
  try {
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found' });

    if (action === 'approve') {
      winner.paymentStatus = 'paid';
      winner.verifiedAt    = new Date();
      winner.paidAt        = new Date();
    } else {
      winner.paymentStatus = 'rejected';
      winner.adminNote     = note || '';
    }

    await draw.save();
    res.json({ success: true, message: `Winner ${action}d`, winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
