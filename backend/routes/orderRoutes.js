const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, cancelOrder,
  adminGetOrders, updateOrderStatus, getAnalytics,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/admin/all', authorize('admin'), adminGetOrders);
router.get('/admin/analytics', authorize('admin'), getAnalytics);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
