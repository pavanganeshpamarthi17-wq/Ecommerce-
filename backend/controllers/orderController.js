const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');

const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod = 'stripe', paymentInfo, couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.filter((i) => !i.savedForLater).length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  const activeItems = cart.items.filter((i) => !i.savedForLater);

  // Validate stock and build order items
  const orderItems = [];
  for (const item of activeItems) {
    const product = await Product.findById(item.product._id);
    if (!product || !product.isActive) {
      return next(new AppError(`Product ${item.product.title} is no longer available`, 400));
    }
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.title}. Available: ${product.stock}`, 400));
    }
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
      sku: product.sku,
    });
  }

  // Calculate pricing
  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = cart.couponDiscount || 0;
  const total = subtotal + tax + shippingCost - discount;

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentInfo: paymentInfo || { status: 'pending' },
    pricing: { subtotal, tax, shippingCost, discount, total },
    couponCode: cart.couponCode,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.couponDiscount = 0;
  await cart.save();

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: `<h2>Order Confirmed!</h2><p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p><p>Total: $${total.toFixed(2)}</p>`,
    });
  } catch {
    // non-critical
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-statusHistory'),
    Order.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    orders,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) return next(new AppError('Order not found', 404));

  // Customers can only view their own orders
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.status(200).json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  if (order.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized', 403));
  }

  if (!['pending', 'paid'].includes(order.orderStatus)) {
    return next(new AppError('Order cannot be cancelled at this stage', 400));
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: order.cancelReason });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  await order.save();
  res.status(200).json({ success: true, order });
});

// @desc    Admin: Get all orders
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const adminGetOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    orders,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// @desc    Admin: Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, trackingNumber, carrier, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (status === 'shipped') {
    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
  }
  if (status === 'delivered') order.deliveredAt = Date.now();
  if (status === 'paid') order.paymentInfo.paidAt = Date.now();

  await order.save();

  // Notify customer
  try {
    const user = await require('../models/User').findById(order.user).select('email name');
    await sendEmail({
      to: user.email,
      subject: `Order ${order.orderNumber} Status Update`,
      html: `<h2>Order Update</h2><p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>`,
    });
  } catch {}

  res.status(200).json({ success: true, order });
});

// @desc    Admin: Get dashboard analytics
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalOrders,
    totalRevenue,
    monthOrders,
    monthRevenue,
    ordersByStatus,
    salesTrend,
    topProducts,
  ] = await Promise.all([
    Order.countDocuments({ orderStatus: { $ne: 'cancelled' } }),
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'cancelled' } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', title: { $first: '$items.title' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalUsers = await require('../models/User').countDocuments({ role: 'customer' });
  const totalProducts = await require('../models/Product').countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthOrders,
      monthRevenue: monthRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      ordersByStatus,
      salesTrend,
      topProducts,
    },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  adminGetOrders,
  updateOrderStatus,
  getAnalytics,
};
