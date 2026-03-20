const express = require('express');
const router  = express.Router();
const { getAnalytics, getUsers, getUser, updateUser, manageSubscription, getPayments } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/analytics',                   getAnalytics);
router.get('/users',                       getUsers);
router.get('/users/:id',                   getUser);
router.put('/users/:id',                   updateUser);
router.put('/users/:id/subscription',      manageSubscription);
router.get('/payments',                    getPayments);

module.exports = router;
