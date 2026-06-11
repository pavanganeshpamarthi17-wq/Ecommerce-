const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return next(new AppError('Address not found', 404));

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.addresses.pull({ _id: req.params.addressId });
  await user.save();

  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc    Admin: Get all users
// @route   GET /api/users
// @access  Private/Admin
const adminGetUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { search, role } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    users,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Admin: Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const adminUpdateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, isActive },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, user });
});

// @desc    Admin: Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const adminDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));
  if (user._id.toString() === req.user.id) return next(new AppError('Cannot delete yourself', 400));
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser,
};
