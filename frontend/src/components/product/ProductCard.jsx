import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { notify } from '../../store/slices/uiSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { products: wishlistProducts } = useSelector((s) => s.wishlist);

  const isWishlisted = wishlistProducts.some(
    (p) => (p._id || p) === product._id
  );

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPct = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(notify('Please login to add items to cart', 'warning'));
      return;
    }
    const result = await dispatch(addToCart({ productId: product._id }));
    if (addToCart.fulfilled.match(result)) {
      dispatch(notify(`"${product.title}" added to cart`, 'success'));
    } else {
      dispatch(notify(result.payload || 'Failed to add to cart', 'error'));
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(notify('Please login to use wishlist', 'warning'));
      return;
    }
    await dispatch(toggleWishlist(product._id));
  };

  const image = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discountPct > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Actions overlay */}
          <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className={`w-9 flex items-center justify-center rounded-lg transition-colors ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-1 truncate">{product.brand}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 leading-snug">{product.title}</h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{product.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">₹{effectivePrice.toLocaleString()}</span>
            {discountPct > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
