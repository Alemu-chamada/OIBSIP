import api from './axios';

/**
 * Auth API Service
 * All endpoints rely on httpOnly cookies automatically handled by browser credentials.
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get('/auth/verify-email', { params: { token } });
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await api.post('/auth/admin-login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const adminLogout = async () => {
  const response = await api.post('/auth/admin-logout');
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
