const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct, uploadAvatar, cloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// Upload avatar
router.post('/avatar', protect, uploadAvatar.single('avatar'), asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file uploaded', 400));

  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  // Delete old avatar from Cloudinary
  if (user.avatar.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId);
  }

  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, avatar: user.avatar });
}));

// Upload product images (admin)
router.post('/product-images', protect, authorize('admin'), uploadProduct.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  res.status(200).json({ success: true, images });
}));

module.exports = router;
