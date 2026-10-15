import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * ProtectedRoute Component
 * Guards routes according to authentication status and user role.
 */
const ProtectedRoute = ({ children, requiredRole = 'customer' }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = requiredRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallbackPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
