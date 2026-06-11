import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { closeCartSidebar } from '../../store/slices/uiSlice';
import { removeFromCart, updateCartItem } from '../../store/slices/cartSlice';
import { notify } from '../../store/slices/uiSlice';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { cartSidebarOpen } = useSelector((s) => s.ui);
  const { items, subtotal, tax, shippingCost, total, loading } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const activeItems = items.filter((i) => !i.savedForLater);

  const handleRemove = async (itemId) => {
    const result = await dispatch(removeFromCart(itemId));
    if (removeFromCart.fulfilled.match(result)) dispatch(notify('Item removed from cart', 'info'));
  };

  const handleQty = async (itemId, qty) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ itemId, quantity: qty }));
  };

  const getImage = (item) => item.product?.images?.[0]?.url || 'https://via.placeholder.com/80?text=No+Img';

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${cartSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(closeCartSidebar())}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Cart ({activeItems.length})
          </h2>
          <button
            onClick={() => dispatch(closeCartSidebar())}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">Login to view your cart</p>
              <Link
                to="/login"
                onClick={() => dispatch(closeCartSidebar())}
                className="btn btn-primary text-sm"
              >
                Login
              </Link>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">Your cart is empty</p>
              <Link
                to="/products"
                onClick={() => dispatch(closeCartSidebar())}
                className="btn btn-primary text-sm"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            activeItems.map((item) => (
              <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <img
                  src={getImage(item)}
                  alt={item.product?.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                    {item.product?.title}
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    ₹{item.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleQty(item._id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 rounded-l-lg"
                        disabled={loading}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 rounded-r-lg"
                        disabled={loading || item.quantity >= item.product?.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && activeItems.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span><span>₹{tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t">
                <span>Total</span><span>₹{total?.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/cart"
                onClick={() => dispatch(closeCartSidebar())}
                className="btn btn-outline flex-1 text-sm"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => dispatch(closeCartSidebar())}
                className="btn btn-primary flex-1 text-sm"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
