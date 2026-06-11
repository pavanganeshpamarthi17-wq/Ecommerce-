import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart, Heart, Star, Truck, Shield, RotateCcw,
  Minus, Plus, ChevronRight, ChevronLeft, AlertCircle,
} from 'lucide-react';
import { fetchProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { notify } from '../../store/slices/uiSlice';
import ProductCard from '../../components/product/ProductCard';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, relatedProducts, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { products: wishlistProducts } = useSelector((s) => s.wishlist);

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    window.scrollTo({ top: 0 });
  }, [id, dispatch]);

  useEffect(() => {
    if (product) {
      api.get(`/reviews/${id}`).then((r) => setReviews(r.data.reviews || []));
    }
  }, [id, product]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-gray-500">Product not found</p>
    </div>
  );

  const isWishlisted = wishlistProducts.some((p) => (p._id || p) === product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPct = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const images = product.images?.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/600?text=No+Image' }];

  const handleAddToCart = async () => {
    if (!isAuthenticated) { dispatch(notify('Please login to add to cart', 'warning')); return; }
    const result = await dispatch(addToCart({ productId: product._id, quantity: qty }));
    if (addToCart.fulfilled.match(result)) dispatch(notify('Added to cart!', 'success'));
    else dispatch(notify(result.payload || 'Failed', 'error'));
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { dispatch(notify('Please login', 'warning')); return; }
    const result = await dispatch(toggleWishlist(product._id));
    if (toggleWishlist.fulfilled.match(result)) {
      dispatch(notify(result.payload.added ? 'Added to wishlist' : 'Removed from wishlist', 'success'));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { dispatch(notify('Please login to review', 'warning')); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      const r = await api.get(`/reviews/${id}`);
      setReviews(r.data.reviews || []);
      setReviewForm({ rating: 5, title: '', comment: '' });
      dispatch(notify('Review submitted!', 'success'));
    } catch (err) {
      dispatch(notify(err.response?.data?.message || 'Failed', 'error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a>
        <ChevronRight className="w-3.5 h-3.5" />
        <a href="/products" className="hover:text-blue-600">Products</a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            <img
              src={images[selectedImage]?.url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">{product.brand}</p>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            </div>
            <button onClick={handleWishlist} className={`p-2 rounded-xl border ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm font-medium text-gray-700">{product.rating?.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{effectivePrice.toLocaleString()}</span>
            {discountPct > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="badge badge-danger text-sm">-{discountPct}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-5">
            {product.stock > 0 ? (
              <span className="badge badge-success">
                ✓ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-2.5 hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn btn-outline flex-1"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn btn-primary flex-1"
            >
              Buy Now
            </button>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Over ₹500' },
              { icon: Shield, label: 'Secure', sub: 'Safe checkout' },
              { icon: RotateCcw, label: 'Returns', sub: '30 days' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="text-xs text-gray-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['description', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <p>{product.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Product Details</h4>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li><span className="font-medium">SKU:</span> {product.sku}</li>
                  <li><span className="font-medium">Brand:</span> {product.brand}</li>
                  <li><span className="font-medium">Category:</span> {product.category?.name}</li>
                  {product.weight > 0 && <li><span className="font-medium">Weight:</span> {product.weight}g</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Review form */}
            {isAuthenticated && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Rating</label>
                    <StarRating
                      rating={reviewForm.rating}
                      size="lg"
                      interactive
                      onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Review title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="input"
                  />
                  <textarea
                    placeholder="Share your experience with this product…"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    required
                    rows={3}
                    className="input resize-none"
                  />
                  <button type="submit" disabled={submittingReview} className="btn btn-primary">
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700">
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{review.user?.name}</span>
                        {review.isVerifiedPurchase && (
                          <span className="badge badge-success text-xs">Verified Purchase</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      {review.title && <p className="font-medium text-gray-800 text-sm mt-1">{review.title}</p>}
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
