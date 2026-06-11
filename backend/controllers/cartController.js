const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const TAX_RATE = 0.18; // 18%
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

// Helper: calculate cart totals
const calcTotals = (items) => {
  const activeItems = items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shippingCost;
  return { subtotal, tax, shippingCost, total };
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'title images price discountPrice stock isActive brand'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const totals = calcTotals(cart.items);

  res.status(200).json({ success: true, cart, ...totals });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) return next(new AppError('Product not found', 404));
  if (product.stock < quantity) return next(new AppError(`Only ${product.stock} items in stock`, 400));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && !item.savedForLater
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) return next(new AppError(`Only ${product.stock} items in stock`, 400));
    existingItem.quantity = newQty;
    existingItem.price = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice || product.price,
    });
  }

  await cart.save();
  await cart.populate('items.product', 'title images price discountPrice stock brand');

  const totals = calcTotals(cart.items);
  res.status(200).json({ success: true, cart, ...totals });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Item not found in cart', 404));

  const product = await Product.findById(item.product);
  if (quantity > product.stock) return next(new AppError(`Only ${product.stock} items in stock`, 400));

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'title images price discountPrice stock brand');

  const totals = calcTotals(cart.items);
  res.status(200).json({ success: true, cart, ...totals });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.items.pull({ _id: req.params.itemId });
  await cart.save();
  await cart.populate('items.product', 'title images price discountPrice stock brand');

  const totals = calcTotals(cart.items);
  res.status(200).json({ success: true, cart, ...totals });
});

// @desc    Save item for later
// @route   PUT /api/cart/:itemId/save-later
// @access  Private
const saveForLater = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  const item = cart.items.id(req.params.itemId);
  if (!item) return next(new AppError('Item not found', 404));

  item.savedForLater = !item.savedForLater;
  await cart.save();

  res.status(200).json({ success: true, message: item.savedForLater ? 'Saved for later' : 'Moved to cart' });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], couponCode: null, couponDiscount: 0 });
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, saveForLater, clearCart };
