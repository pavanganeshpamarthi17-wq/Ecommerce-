import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
import { fetchOrder, cancelOrder } from '../../store/slices/orderSlice';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_ICONS = {
  pending:    <Clock className="w-4 h-4" />,
  paid:       <CheckCircle className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped:    <Truck className="w-4 h-4" />,
  delivered:  <CheckCircle className="w-4 h-4" />,
  cancelled:  <XCircle className="w-4 h-4" />,
};

const STATUS_COLORS = {
  pending:    'text-yellow-600 bg-yellow-50',
  paid:       'text-blue-600 bg-blue-50',
  processing: 'text-blue-600 bg-blue-50',
  shipped:    'text-purple-600 bg-purple-50',
  delivered:  'text-green-600 bg-green-50',
  cancelled:  'text-red-600 bg-red-50',
};

const TIMELINE_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const result = await dispatch(cancelOrder({ id, reason: 'Cancelled by customer' }));
    if (cancelOrder.fulfilled.match(result)) {
      dispatch(notify('Order cancelled successfully', 'info'));
    } else {
      dispatch(notify('Failed to cancel order', 'error'));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-16 text-gray-400">Order not found</div>;

  const currentStepIdx = TIMELINE_STEPS.indexOf(order.orderStatus);
  const canCancel = ['pending', 'paid'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[order.orderStatus]}`}>
            {STATUS_ICONS[order.orderStatus]}
            {order.orderStatus}
          </span>
          {canCancel && (
            <button onClick={handleCancel} className="btn btn-danger text-sm py-1.5 px-3">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
          <div className="flex items-center justify-between overflow-x-auto gap-1">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    } ${active ? 'ring-4 ring-blue-100' : ''}`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs capitalize font-medium ${done ? 'text-blue-600' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm">
              <span className="font-medium text-blue-700">Tracking: </span>
              <span className="text-blue-600">{order.trackingNumber}</span>
              {order.carrier && <span className="text-blue-500"> via {order.carrier}</span>}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" /> Items ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Shipping Address
            </h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        {/* Pricing + Payment */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.pricing?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{order.pricing?.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.pricing?.shippingCost === 0
                  ? <span className="text-green-600">Free</span>
                  : `₹${order.pricing?.shippingCost}`}
                </span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.pricing?.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{order.pricing?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Payment
            </h3>
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium capitalize ${order.paymentInfo?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentInfo?.status}
                </span>
              </div>
              {order.paymentInfo?.paidAt && (
                <div className="flex justify-between text-gray-600">
                  <span>Paid on</span>
                  <span>{new Date(order.paymentInfo.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
