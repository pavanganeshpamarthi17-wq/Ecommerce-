const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get product reviews
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    distribution,
  });
});

// @desc    Create review
// @route   POST /api/reviews/:productId
// @access  Private
const createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) return next(new AppError('Product not found', 404));

  // Check if already reviewed
  const existing = await Review.findOne({ user: req.user.id, product: productId });
  if (existing) return next(new AppError('You have already reviewed this product', 400));

  // Check verified purchase
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  const review = await Review.create({
    user: req.user.id,
    product: productId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, review });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

  const { rating, title, comment } = req.body;
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  await review.save();

  res.status(200).json({ success: true, review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

// @desc    Vote helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const voteHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const alreadyVoted = review.helpfulVotes.includes(req.user.id);
  if (alreadyVoted) {
    review.helpfulVotes.pull(req.user.id);
  } else {
    review.helpfulVotes.push(req.user.id);
  }
  await review.save();

  res.status(200).json({ success: true, helpfulCount: review.helpfulVotes.length, voted: !alreadyVoted });
});

module.exports = { getProductReviews, createReview, updateReview, deleteReview, voteHelpful };
