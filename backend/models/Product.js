const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  alt: { type: String, default: '' },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
    },
    images: [imageSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual: reviews (populated separately)
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Auto-generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  // Auto-generate SKU if not provided
  if (!this.sku) {
    this.sku = 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
