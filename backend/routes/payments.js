const express = require('express');
const router  = express.Router();
const { createCheckout, createPortal, webhook, getHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/webhook',          webhook);   // raw body — no protect
router.post('/create-checkout',  protect, createCheckout);
router.post('/portal',           protect, createPortal);
router.get ('/history',          protect, getHistory);

module.exports = router;
