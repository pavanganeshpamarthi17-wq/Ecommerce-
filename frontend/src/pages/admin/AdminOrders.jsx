import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { adminFetchOrders, adminUpdateOrderStatus, fetchOrder } from '../../store/slices/orderSlice';
import { notify } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_STYLES = {
  pending: 'badge-warning', paid: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger',
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, total, totalPages, currentPage } = useSelector((s) => s.orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '', carrier: '', note: '' });

  const load = (page = 1) => {
    dispatch(adminFetchOrders({ page, limit: 15, status: statusFilter, search }));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !statusForm.status) return;
    setUpdatingStatus(true);
    const result = await dispatch(adminUpdateOrderStatus({ id: selectedOrder._id, data: statusForm }));
    setUpdatingStatus(false);
    if (adminUpdateOrderStatus.fulfilled.match(result)) {
      dispatch(notify('Order status updated!', 'success'));
      setSelectedOrder(null);
      setStatusForm({ status: '', trackingNumber: '', carrier: '', note: '' });
    } else {
      dispatch(notify(result.payload || 'Failed', 'error'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary px-4">Search</button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto min-w-[140px]"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="font-medium text-gray-700">{order.user?.name}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{order.pricing?.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${STATUS_STYLES[order.orderStatus] || 'badge-gray'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusForm({ status: order.orderStatus, trackingNumber: order.trackingNumber || '', carrier: order.carrier || '', note: '' });
                          }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => load(page)}
          />
        </div>
      )}

      {/* Status update modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-gray-900">Update Order Status</h3>
              <p className="text-sm text-gray-400 mt-0.5">{selectedOrder.orderNumber}</p>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
                  required
                  className="input"
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              {statusForm.status === 'shipped' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                    <input
                      type="text"
                      value={statusForm.trackingNumber}
                      onChange={(e) => setStatusForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                      className="input"
                      placeholder="e.g. 1Z999AA10123456784"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Carrier</label>
                    <input
                      type="text"
                      value={statusForm.carrier}
                      onChange={(e) => setStatusForm((f) => ({ ...f, carrier: e.target.value }))}
                      className="input"
                      placeholder="e.g. FedEx, DHL, India Post"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <input
                  type="text"
                  value={statusForm.note}
                  onChange={(e) => setStatusForm((f) => ({ ...f, note: e.target.value }))}
                  className="input"
                  placeholder="Internal note…"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={updatingStatus} className="btn btn-primary flex-1">
                  {updatingStatus ? 'Updating…' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
