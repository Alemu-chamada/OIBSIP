import api from './axios';

/**
 * Order API Client
 * Wraps order creation, payment verification, and order queries.
 * Plan Reference: project_plan.md §10.3, §11.3
 */

/**
 * Initiates Razorpay test order creation on the server.
 * @param {Object} payload - { base: string, sauce: string, cheese: string, vegetables: string[] }
 * @returns {Promise<Object>} { razorpayOrderId, amount, currency, orderId }
 */
export const createRazorpayOrder = async (payload) => {
  const response = await api.post('/orders/create-razorpay-order', payload);
  return response.data;
};

/**
 * Verifies Razorpay payment signature server-side.
 * @param {Object} payload - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {Promise<Object>} { orderId, orderStatus, paymentStatus, alreadyConfirmed }
 */
export const verifyPayment = async (payload) => {
  const response = await api.post('/orders/verify-payment', payload);
  return response.data;
};

/**
 * Fetches authenticated customer's orders.
 * @returns {Promise<Object>} { orders: Array }
 */
export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

/**
 * Fetches order status by order ID (for polling/status display).
 * @param {string} orderId
 * @returns {Promise<Object>} { orderId, orderStatus, paymentStatus }
 */
export const getOrderStatus = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/status`);
  return response.data;
};
