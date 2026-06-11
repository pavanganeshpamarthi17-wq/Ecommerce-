const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
    'products',
    'title price discountPrice images rating numReviews stock slug brand'
  );
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  res.status(200).json({ success: true, wishlist });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user.id, products: [] });

  const index = wishlist.products.indexOf(productId);
  let added;
  if (index > -1) {
    wishlist.products.splice(index, 1);
    added = false;
  } else {
    wishlist.products.push(productId);
    added = true;
  }
  await wishlist.save();

  res.status(200).json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
});

const moveToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return next(new AppError('Product not found', 404));
  if (product.stock < 1) return next(new AppError('Product out of stock', 400));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (!existing) {
    cart.items.push({ product: productId, quantity: 1, price: product.discountPrice || product.price });
    await cart.save();
  }

  // Remove from wishlist
  await Wishlist.findOneAndUpdate({ user: req.user.id }, { $pull: { products: productId } });

  res.status(200).json({ success: true, message: 'Moved to cart' });
});

module.exports = { getWishlist, toggleWishlist, moveToCart };
