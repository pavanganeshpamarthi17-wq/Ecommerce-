const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

// Protect routes - verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return next(new AppError('User no longer exists', 401));
    if (!user.isActive) return next(new AppError('Account deactivated', 403));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh.', 401));
    }
    return next(new AppError('Invalid token', 401));
  }
});

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized for this resource`, 403));
    }
    next();
  };
};

// Optional auth (doesn't fail if not authenticated)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore errors for optional auth
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };
