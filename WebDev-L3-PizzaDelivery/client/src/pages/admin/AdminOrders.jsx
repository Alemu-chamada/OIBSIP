import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateAdminOrderStatus } from '../../api/admin.api';

const ORDER_STATUS_OPTIONS = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminOrders();
      setOrders(data.data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError('');
    setSuccessMsg('');

    try {
      await updateAdminOrderStatus(orderId, newStatus);
      setSuccessMsg(`Order #${orderId.slice(-6)} status updated to "${newStatus}".`);

      // Update locally for immediate responsiveness
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
      // Re-fetch to ensure sync
      fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Orders</h2>
          <p className="text-sm text-gray-500">
            View all placed orders and advance their progress from kitchen to delivery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Orders'}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <label htmlFor="order-status-filter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-800"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {ORDER_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.orderStatus === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
          No orders found matching the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order / Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pizza Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status Transition
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const isUpdating = updatingOrderId === order._id;
                const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">{dateStr}</div>
                      <div className="mt-1 text-sm font-medium text-gray-800">
                        {order.customer?.name || 'Customer'}
                      </div>
                      <div className="text-xs text-gray-500">{order.customer?.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-0.5">
                        <div>
                          <span className="font-medium text-gray-600">Base:</span>{' '}
                          {order.items?.base?.name || 'Standard'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Sauce:</span>{' '}
                          {order.items?.sauce?.name || 'Standard'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Cheese:</span>{' '}
                          {order.items?.cheese?.name || 'Standard'}
                        </div>
                        {order.items?.vegetables && order.items.vegetables.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-600">Veggies:</span>{' '}
                            {order.items.vegetables.map((v) => v.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{order.totalPrice}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.paymentStatus?.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.orderStatus}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2.5 py-1.5 bg-white font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50"
                        >
                          {ORDER_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <span className="text-xs text-gray-500 animate-pulse">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
