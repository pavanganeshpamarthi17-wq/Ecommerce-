import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { fetchOrder } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-2">Thank you for your purchase</p>
      {order && (
        <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-full mb-8">
          Order #{order.orderNumber}
        </p>
      )}

      {order && (
        <div className="card p-5 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium capitalize ${order.orderStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold text-gray-900">₹{order.pricing?.total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{order.items?.length} item(s)</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={`/orders/${id}`} className="btn btn-outline">
          <Package className="w-4 h-4" /> Track Order
        </Link>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
