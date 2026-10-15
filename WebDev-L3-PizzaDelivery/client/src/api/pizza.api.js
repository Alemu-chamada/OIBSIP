import api from './axios';

/**
 * Fetch all available pizza options across all categories.
 * GET /api/pizza-options
 */
export const getAllPizzaOptions = async () => {
  const response = await api.get('/pizza-options');
  return response.data;
};

/**
 * Fetch available pizza options for a specific category.
 * GET /api/pizza-options/:category
 * @param {string} category - 'base' | 'sauce' | 'cheese' | 'vegetable'
 */
export const getPizzaOptionsByCategory = async (category) => {
  const response = await api.get(`/pizza-options/${category}`);
  return response.data;
};
