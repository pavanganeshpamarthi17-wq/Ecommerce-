const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { cloudinary } = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ isActive: true }).populate('category', 'name slug'),
    req.query
  )
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments(features.filterQuery),
  ]);

  const { page = 1, limit = 12 } = req.query;

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name avatar' },
      match: { isApproved: true },
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

  if (!product) return next(new AppError('Product not found', 404));

  // Get related products
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .select('title price discountPrice images rating numReviews slug');

  res.status(200).json({ success: true, product, related });
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    alt: product.title,
  }));

  product.images.push(...images);
  await product.save();

  res.status(200).json({ success: true, images: product.images });
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  const image = product.images.id(req.params.imageId);
  if (!image) return next(new AppError('Image not found', 404));

  if (image.publicId) await cloudinary.uploader.destroy(image.publicId);

  product.images.pull({ _id: req.params.imageId });
  await product.save();

  res.status(200).json({ success: true, message: 'Image deleted' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(8)
    .select('title price discountPrice images rating numReviews slug brand')
    .populate('category', 'name');

  res.status(200).json({ success: true, products });
});

// @desc    Admin: get all products including inactive
// @route   GET /api/products/admin/all
// @access  Private/Admin
const adminGetProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  getFeaturedProducts,
  adminGetProducts,
};
