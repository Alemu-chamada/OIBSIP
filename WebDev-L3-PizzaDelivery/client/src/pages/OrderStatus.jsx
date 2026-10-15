import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import OrderStatusProgress from '../components/orders/OrderStatusProgress';
import useOrderStatus from '../hooks/useOrderStatus';

const OrderStatus = () => {
  const { orderId } = useParams();
  const { order, loading, error, isPolling, refetch } = useOrderStatus(orderId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/my-orders"
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition flex items-center gap-1"
          >
            ← Back to My Orders
          </Link>
          <div className="flex items-center gap-2">
            {isPolling && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Polling (5s)
              </span>
            )}
            <button
              type="button"
              onClick={refetch}
              className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md font-medium transition"
              title="Manually refresh status"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4" />
            <h3 className="text-base font-bold text-gray-800">Checking Order Status...</h3>
            <p className="text-sm text-gray-500 mt-1">Contacting the pizzeria database</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Order Status</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/my-orders"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-lg transition"
              >
                Go to My Orders
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition"
              >
                Return to Menu
              </Link>
            </div>
          </div>
        )}

        {/* Order Details & Progress */}
        {!loading && !error && order && (
          <div className="space-y-6">
            {/* Top Card: Status & Stepper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Order Tracking
                  </span>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-0.5">
                    Order #{order.orderId?.slice(-8) || order.orderId}
                  </h1>
                  {order.createdAt && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <OrderStatusProgress currentStatus={order.orderStatus} />
            </div>

            {/* Bottom Card: Pizza Configuration Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                Pizza Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Crust Base</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {order.items?.base?.name || 'Selected Base'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Sauce</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {order.items?.sauce?.name || 'Selected Sauce'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Cheese</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {order.items?.cheese?.name || 'Selected Cheese'}
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-semibold block">Vegetables</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {order.items?.vegetables && order.items.vegetables.length > 0
                      ? order.items.vegetables.map((v) => v.name).join(', ')
                      : 'None selected (Plain)'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Total Price Paid</span>
                <span className="text-xl font-black text-red-600">₹{order.totalPrice}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <Link
                to="/dashboard"
                className="px-6 py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
              >
                ← Back to Dashboard
              </Link>
              <Link
                to="/builder"
                className="px-8 py-3 text-center bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition text-sm"
              >
                Build Another Pizza 🍕
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderStatus;
