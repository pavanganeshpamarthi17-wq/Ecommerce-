const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register, login, logout, refreshToken, getMe, forgotPassword, resetPassword, verifyEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/).withMessage('Password must contain upper, lower, and number'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
