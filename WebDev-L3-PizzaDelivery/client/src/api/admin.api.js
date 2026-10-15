import api from './axios';

/**
 * Admin API Client
 * Wraps protected admin endpoints for inventory management and order lifecycle updates.
 * Plan Reference: project_plan.md §4.2, §10.4 (FR-A03, FR-A05, FR-A07, FR-A08)
 */

/**
 * Fetches all inventory items with current stock and low-stock indicators.
 * @returns {Promise<Object>} { inventory: Array, count: number, lowStockCount: number }
 */
export const getAdminInventory = async () => {
  const response = await api.get('/admin/inventory');
  return response.data;
};

/**
 * Updates current stock quantity for an individual inventory item.
 * @param {string} itemId
 * @param {number} currentStock
 * @returns {Promise<Object>} { item: Object }
 */
export const updateAdminStock = async (itemId, currentStock) => {
  const response = await api.patch(`/admin/inventory/${itemId}`, { currentStock });
  return response.data;
};

/**
 * Fetches all customer orders (sorted newest first) with customer and items populated.
 * @returns {Promise<Object>} { orders: Array, count: number }
 */
export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

/**
 * Updates order lifecycle status ('Order Received' | 'In Kitchen' | 'Sent to Delivery').
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<Object>} { order: Object }
 */
export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};
