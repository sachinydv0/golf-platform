// routes/auth.js
const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body }    = require('express-validator');

router.post('/register', [
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], register);

router.post('/login',           login);
router.get ('/me',    protect,  getMe);
router.put ('/profile', protect, updateProfile);
router.put ('/change-password', protect, changePassword);

module.exports = router;
