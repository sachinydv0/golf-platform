const express = require('express');
const router  = express.Router();
const { getDraws, getDraw, getCurrentDraw, getMyDraws, simulateDraw, publishDraw, adminGetDraws } = require('../controllers/drawController');
const { protect, adminOnly, requireSubscription } = require('../middleware/auth');

router.get('/',          getDraws);
router.get('/current',   getCurrentDraw);
router.get('/my',        protect, requireSubscription, getMyDraws);
router.get('/:id',       getDraw);

// Admin
router.post('/simulate',   protect, adminOnly, simulateDraw);
router.post('/publish',    protect, adminOnly, publishDraw);
router.get ('/admin/all',  protect, adminOnly, adminGetDraws);

module.exports = router;
