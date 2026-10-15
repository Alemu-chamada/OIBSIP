import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PizzaBuilder from './pages/PizzaBuilder';
import OrderSummary from './pages/OrderSummary';
import OrderStatus from './pages/OrderStatus';
import MyOrders from './pages/MyOrders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <BrowserRouter>
          <Routes>
            {/* Public customer auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Customer protected routes */}
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute requiredRole="customer">
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/builder"
              element={(
                <ProtectedRoute requiredRole="customer">
                  <PizzaBuilder />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/order-summary"
              element={(
                <ProtectedRoute requiredRole="customer">
                  <OrderSummary />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/order-status/:orderId"
              element={(
                <ProtectedRoute requiredRole="customer">
                  <OrderStatus />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/my-orders"
              element={(
                <ProtectedRoute requiredRole="customer">
                  <MyOrders />
                </ProtectedRoute>
              )}
            />

          {/* Separate admin auth and protected routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={(
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/inventory"
            element={(
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/orders"
            element={(
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />

          {/* Default fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  </AuthProvider>
  );
}

export default App;
