import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAdmin, adminLogout } = useAuth();

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
    } else {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label="pizza">🍕</span>
            <span className="text-xl font-black text-primary tracking-tight">Pizza Delivery</span>
          </Link>
          {isAdmin && (
            <span className="bg-gray-900 text-white text-xs uppercase px-2 py-0.5 rounded font-bold">
              Admin
            </span>
          )}
        </div>

        <nav className="flex items-center space-x-3 sm:space-x-6">
          {!isAdmin && (
            <>
              <Link
                to="/dashboard"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 transition"
              >
                <span className="hidden sm:inline">Menu & Catalogue</span>
                <span className="sm:hidden">Menu</span>
              </Link>
              <Link
                to="/my-orders"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 transition"
              >
                My Orders
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden md:inline">
                Signed in as <strong className="text-gray-800">{user.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-1.5 px-3.5 rounded transition"
              >
                Log Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
