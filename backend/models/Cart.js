const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  savedForLater: { type: Boolean, default: false },
  price: { type: Number, required: true }, // price snapshot at time of adding
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: total items count
cartSchema.virtual('itemCount').get(function () {
  return this.items
    .filter((i) => !i.savedForLater)
    .reduce((acc, item) => acc + item.quantity, 0);
});

// Virtual: subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items
    .filter((i) => !i.savedForLater)
    .reduce((acc, item) => acc + item.price * item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
