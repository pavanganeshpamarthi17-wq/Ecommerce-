const express = require('express');
const router = express.Router();
const {
  updateProfile, changePassword, addAddress, updateAddress, deleteAddress,
  adminGetUsers, adminUpdateUser, adminDeleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Admin
router.get('/', authorize('admin'), adminGetUsers);
router.put('/:id', authorize('admin'), adminUpdateUser);
router.delete('/:id', authorize('admin'), adminDeleteUser);

module.exports = router;
