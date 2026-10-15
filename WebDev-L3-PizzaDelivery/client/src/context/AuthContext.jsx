import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data && data.data && data.data.user) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data && data.data && data.data.user) {
      setUser(data.data.user);
    }
    return data;
  };

  const adminLogin = async (credentials) => {
    const data = await authApi.adminLogin(credentials);
    if (data && data.data && data.data.admin) {
      setUser(data.data.admin);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const adminLogout = async () => {
    try {
      await authApi.adminLogout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    logout,
    adminLogout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
