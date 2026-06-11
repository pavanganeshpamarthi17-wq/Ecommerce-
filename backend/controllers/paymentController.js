let stripe;
const hasStripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder') && !process.env.STRIPE_SECRET_KEY.includes('your_stripe');

if (hasStripe) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  // Use mock stripe client in local dev if no key is configured
  stripe = {
    paymentIntents: {
      create: async ({ amount, currency, metadata }) => {
        return {
          id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
          client_secret: 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9),
        };
      },
    },
    refunds: {
      create: async () => {
        return {
          id: 're_mock_' + Math.random().toString(36).substr(2, 9),
        };
      },
    },
  };
}

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.filter((i) => !i.savedForLater).length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shippingCost;

  // Amount in smallest currency unit (paise for INR, cents for USD)
  const amountInCents = Math.round(total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'inr', // Change to 'usd' as needed
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: req.user.id,
      userEmail: req.user.email,
    },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: total,
    breakdown: { subtotal, tax, shippingCost, total },
  });
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      await Order.findOneAndUpdate(
        { 'paymentInfo.stripePaymentIntentId': pi.id },
        {
          orderStatus: 'paid',
          'paymentInfo.status': 'paid',
          'paymentInfo.paidAt': new Date(),
          $push: { statusHistory: { status: 'paid', note: 'Payment confirmed via Stripe' } },
        }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Order.findOneAndUpdate(
        { 'paymentInfo.stripePaymentIntentId': pi.id },
        {
          'paymentInfo.status': 'failed',
          $push: { statusHistory: { status: 'pending', note: 'Payment failed' } },
        }
      );
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      await Order.findOneAndUpdate(
        { 'paymentInfo.stripeChargeId': charge.id },
        {
          orderStatus: 'cancelled',
          'paymentInfo.status': 'refunded',
          $push: { statusHistory: { status: 'cancelled', note: 'Payment refunded' } },
        }
      );
      break;
    }
  }

  res.status(200).json({ received: true });
});

// @desc    Get payment methods (for UI)
// @route   GET /api/payments/methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    methods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'credit-card', enabled: true },
      { id: 'upi', label: 'UPI', icon: 'upi', enabled: true },
      { id: 'netbanking', label: 'Net Banking', icon: 'bank', enabled: true },
      { id: 'wallet', label: 'Wallet', icon: 'wallet', enabled: true },
    ],
  });
});

// @desc    Refund payment (Admin)
// @route   POST /api/payments/refund/:orderId
// @access  Private/Admin
const refundPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.paymentInfo.status !== 'paid') return next(new AppError('Order has not been paid', 400));

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentInfo.stripePaymentIntentId,
    reason: 'requested_by_customer',
  });

  order.paymentInfo.status = 'refunded';
  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: `Refund issued: ${refund.id}` });
  await order.save();

  res.status(200).json({ success: true, message: 'Refund processed', refund });
});

module.exports = { createPaymentIntent, stripeWebhook, getPaymentMethods, refundPayment };
