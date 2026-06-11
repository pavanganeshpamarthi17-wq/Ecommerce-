import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const STATUS_STYLES = {
  pending:    'badge-warning',
  paid:       'badge-info',
  processing: 'badge-info',
  shipped:    'badge-info',
  delivered:  'badge-success',
  cancelled:  'badge-danger',
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, total, totalPages, currentPage } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders({ page: 1, limit: 10 })); }, [dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders ({total})</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${STATUS_STYLES[order.orderStatus] || 'badge-gray'} capitalize`}>
                      {order.orderStatus}
                    </span>
                    <span className="font-bold text-gray-900">₹{order.pricing?.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {order.items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex-shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/60'}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                      />
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500 font-medium">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{order.items?.length} item(s)</span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(fetchMyOrders({ page, limit: 10 }))}
          />
        </>
      )}
    </div>
  );
};

export default OrdersPage;
