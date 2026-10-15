import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getMyOrders } from '../api/order.api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyOrders();
      if (res && res.success) {
        setOrders(res.data.orders || []);
      } else {
        throw new Error(res?.message || 'Failed to load order history');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Kitchen':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sent to Delivery':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track your recent customized pizza deliveries</p>
          </div>
          <Link
            to="/builder"
            className="self-start sm:self-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm transition"
          >
            + Build New Pizza
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4" />
            <p className="text-sm text-gray-600 font-medium">Loading your order history...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Failed to load orders</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🍕</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Placed Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              You haven&apos;t placed any pizza orders yet. Create your custom pizza using our step-by-step builder!
            </p>
            <Link
              to="/builder"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              Build Your First Pizza →
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPaid = order.paymentStatus === 'paid';
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">
                          Order #{order._id.slice(-8)}
                        </span>
                        {/* Payment Status Badge */}
                        <span
                          className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Order Status Badge */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Ingredients Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 text-gray-700">
                    <div>
                      <span className="text-gray-400 block uppercase font-semibold text-[10px]">Base</span>
                      <span className="font-medium text-gray-900">{order.items?.base?.name || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-semibold text-[10px]">Sauce</span>
                      <span className="font-medium text-gray-900">{order.items?.sauce?.name || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-semibold text-[10px]">Cheese</span>
                      <span className="font-medium text-gray-900">{order.items?.cheese?.name || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-semibold text-[10px]">Vegetables</span>
                      <span className="font-medium text-gray-900 truncate block">
                        {order.items?.vegetables && order.items.vegetables.length > 0
                          ? order.items.vegetables.map((v) => v.name).join(', ')
                          : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: Price & Track Action */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">Total:</span>{' '}
                      <span className="text-lg font-black text-gray-900">₹{order.totalPrice}</span>
                    </div>

                    <Link
                      to={`/order-status/${order._id}`}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                    >
                      Track Live Status →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
