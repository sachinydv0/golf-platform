const express = require('express');
const router  = express.Router();
const { uploadProof, getPendingWinners, verifyWinner } = require('../controllers/winnerController');
const { protect, adminOnly, requireSubscription }       = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/:drawId/proof',          protect, requireSubscription, upload.single('proof'), uploadProof);
router.get ('/pending',                protect, adminOnly, getPendingWinners);
router.put ('/:drawId/:winnerId',       protect, adminOnly, verifyWinner);

module.exports = router;
