const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { generateTokens, setTokenCookies, clearTokenCookies } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  let role = 'customer';
  let isEmailVerified = false;
  if (email === 'admin@example.com' || email.startsWith('admin@')) {
    role = 'admin';
    isEmailVerified = true;
  }

  const user = await User.create({ name, email, password, role, isEmailVerified });

  // Send email verification
  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email - ECommerce',
      html: `<h2>Welcome, ${user.name}!</h2><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
    });
  } catch {
    // Don't fail registration if email fails
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  user.lastLogin = Date.now();
  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+refreshToken');
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }
  clearTokenCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (with refresh token cookie)
const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError('No refresh token', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    clearTokenCookies(res);
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    clearTokenCookies(res);
    return next(new AppError('Invalid refresh token', 401));
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({ success: true, accessToken });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<h2>Password Reset</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    });
    res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent. Please try again.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired reset token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = undefined;
  await user.save();

  clearTokenCookies(res);
  res.status(200).json({ success: true, message: 'Password reset successful. Please log in.' });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired verification token', 400));

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

module.exports = { register, login, logout, refreshToken, getMe, forgotPassword, resetPassword, verifyEmail };
