const express = require('express');
const router = express.Router();
const { createPaymentIntent, stripeWebhook, getPaymentMethods, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Webhook must come before protect middleware (raw body)
router.post('/webhook', stripeWebhook);

router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.get('/methods', getPaymentMethods);
router.post('/refund/:orderId', authorize('admin'), refundPayment);

module.exports = router;
