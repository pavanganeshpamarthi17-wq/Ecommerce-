import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchWishlist, toggleWishlist, moveToCart } from '../store/slices/wishlistSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { notify } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const handleRemove = async (productId) => {
    await dispatch(toggleWishlist(productId));
    dispatch(fetchWishlist());
    dispatch(notify('Removed from wishlist', 'info'));
  };

  const handleMoveToCart = async (productId) => {
    const result = await dispatch(moveToCart(productId));
    if (moveToCart.fulfilled.match(result)) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(notify('Moved to cart!', 'success'));
    } else {
      dispatch(notify(result.payload || 'Failed', 'error'));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> My Wishlist ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Link to="/products" className="btn btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            if (!product || !product._id) return null;
            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            return (
              <div key={product._id} className="card overflow-hidden group">
                <Link to={`/products/${product._id}`} className="relative block aspect-video bg-gray-50 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
                  <Link to={`/products/${product._id}`} className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">
                    {product.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5 mb-3">
                    <StarRating rating={product.rating} size="sm" />
                    <span className="text-xs text-gray-400">({product.numReviews})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-gray-900">₹{effectivePrice?.toLocaleString()}</span>
                    {product.discountPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product._id)}
                      disabled={product.stock === 0}
                      className="btn btn-primary flex-1 text-sm py-2 gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-gray-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
