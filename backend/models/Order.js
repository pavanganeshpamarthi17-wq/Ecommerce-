const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  sku: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'cod'],
      default: 'stripe',
    },
    paymentInfo: {
      stripePaymentIntentId: String,
      stripeChargeId: String,
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, default: 0 },
      shippingCost: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    couponCode: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    trackingNumber: String,
    carrier: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    notes: String,
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'ORD-' + String(count + 1).padStart(6, '0') + '-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
