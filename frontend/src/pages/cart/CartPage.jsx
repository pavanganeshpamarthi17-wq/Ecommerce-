import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { removeFromCart, updateCartItem, clearCart } from '../../store/slices/cartSlice';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, tax, shippingCost, total, loading } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const activeItems = items.filter((i) => !i.savedForLater);

  const handleRemove = async (itemId) => {
    await dispatch(removeFromCart(itemId));
    dispatch(notify('Item removed', 'info'));
  };

  const handleQty = (itemId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: qty }));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is waiting</h2>
        <p className="text-gray-500 mb-6">Sign in to view and manage your cart</p>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (activeItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({activeItems.length})</h1>
        <button
          onClick={() => { dispatch(clearCart()); dispatch(notify('Cart cleared', 'info')); }}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {activeItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                <img
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                  alt={item.product?.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{item.product?.brand}</p>
                    <Link to={`/products/${item.product?._id}`} className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">
                      {item.product?.title}
                    </Link>
                  </div>
                  <button onClick={() => handleRemove(item._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => handleQty(item._id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQty(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50"
                      disabled={item.quantity >= item.product?.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">₹{item.price?.toLocaleString()} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({activeItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
                <span>₹{subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span>₹{tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0
                    ? <span className="text-green-600 font-medium">Free</span>
                    : `₹${shippingCost}`
                  }
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                  Add ₹{(500 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{total?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary w-full text-base py-3"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/products" className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
