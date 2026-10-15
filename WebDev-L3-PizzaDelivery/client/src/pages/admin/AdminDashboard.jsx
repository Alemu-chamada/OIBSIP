import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import { getAdminInventory, getAdminOrders } from '../../api/admin.api';

const AdminDashboard = () => {
  const { user, adminLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on pathname or state
  const getInitialTab = () => {
    if (location.pathname === '/admin/inventory') return 'inventory';
    if (location.pathname === '/admin/orders') return 'orders';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalInventory: 0,
    lowStockCount: 0,
    recentOrders: [],
    lowStockItems: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Sync tab if user navigates with back/forward buttons
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [invRes, ordersRes] = await Promise.all([
        getAdminInventory(),
        getAdminOrders(),
      ]);

      const items = invRes.data?.inventory || invRes.data?.items || [];
      const orders = ordersRes.data?.orders || [];

      const lowStock = items.filter((i) => (
        i.isLowStock !== undefined
          ? Boolean(i.isLowStock)
          : i.currentStock < i.lowStockThreshold
      ));
      const revenue = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalInventory: items.length,
        lowStockCount: lowStock.length,
        recentOrders: orders.slice(0, 5),
        lowStockItems: lowStock,
      });
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      navigate('/admin/inventory');
    } else if (tab === 'orders') {
      navigate('/admin/orders');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🍕</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight">Pizza Delivery Admin Portal</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-600 rounded text-white">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Logged in as <span className="text-gray-200 font-medium">{user?.name}</span> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={adminLogout}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition border border-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 sm:space-x-4 border-t border-gray-800 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => handleTabChange('inventory')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📦 Inventory Management {stats.lowStockCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-600 rounded-full text-white">
                {stats.lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('orders')}
            className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📋 Customer Orders
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Orders
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalOrders}
                </div>
                <div className="mt-1 text-xs text-gray-500">All customer orders</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : `₹${stats.totalRevenue}`}
                </div>
                <div className="mt-1 text-xs text-green-600 font-medium">Verified paid orders</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Inventory Items
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalInventory}
                </div>
                <div className="mt-1 text-xs text-gray-500">Tracked ingredients</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Low Stock Items
                </div>
                <div className={`mt-2 text-3xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {statsLoading ? '...' : stats.lowStockCount}
                </div>
                <div className="mt-1 text-xs text-gray-500">Below minimum threshold</div>
              </div>
            </div>

            {/* Quick Actions & Previews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <button
                    onClick={() => handleTabChange('orders')}
                    className="text-xs font-semibold text-gray-800 hover:text-black underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                {stats.recentOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No orders placed yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.recentOrders.map((o) => (
                      <div key={o._id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            #{o._id.slice(-6).toUpperCase()} — {o.customer?.name || 'Customer'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{o.totalPrice} • {o.items?.base?.name} + {o.items?.cheese?.name}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          {o.orderStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Watchlist Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Watchlist</h3>
                  <button
                    onClick={() => handleTabChange('inventory')}
                    className="text-xs font-semibold text-gray-800 hover:text-black underline"
                  >
                    Manage Inventory &rarr;
                  </button>
                </div>

                {stats.lowStockItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-green-700 bg-green-50 rounded-md">
                    ✓ All ingredient stock levels are currently healthy!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.lowStockItems.map((item) => (
                      <div key={item._id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {item.category} • Threshold: {item.lowStockThreshold} {item.unit}
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                          {item.currentStock} {item.unit} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'orders' && <AdminOrders />}
      </main>
    </div>
  );
};

export default AdminDashboard;
