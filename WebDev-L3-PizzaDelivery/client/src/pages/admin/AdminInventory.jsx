import React, { useState, useEffect } from 'react';
import { getAdminInventory, updateAdminStock } from '../../api/admin.api';

const CATEGORY_LABELS = {
  base: 'Pizza Base',
  sauce: 'Sauce',
  cheese: 'Cheese',
  vegetable: 'Vegetable',
};

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminInventory();
      const items = data.data?.inventory || data.data?.items || [];
      setInventory(items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditValue(item.currentStock.toString());
    setSuccessMsg('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveStock = async (itemId) => {
    const stockNum = parseInt(editValue, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      await updateAdminStock(itemId, stockNum);
      setSuccessMsg('Stock updated successfully.');
      setEditingId(null);
      // Re-fetch to guarantee database sync and low stock flags
      await fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock quantity.');
    } finally {
      setUpdating(false);
    }
  };

  const isItemLowStock = (item) => (
    item.isLowStock !== undefined
      ? Boolean(item.isLowStock)
      : item.currentStock < item.lowStockThreshold
  );

  const filteredItems = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    if (showLowStockOnly && !isItemLowStock(item)) {
      return false;
    }
    return true;
  });

  const lowStockCount = inventory.filter((item) => isItemLowStock(item)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-sm text-gray-500">
            Monitor real-time ingredient levels, thresholds, and adjust quantities manually.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Stock'}
        </button>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-amber-500 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800 font-medium">
                Attention Required: {lowStockCount} ingredient{lowStockCount > 1 ? 's are' : ' is'} below the configured low-stock threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <label htmlFor="cat-filter" className="text-sm font-medium text-gray-700">
            Category:
          </label>
          <select
            id="cat-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-800"
          >
            <option value="all">All Categories</option>
            <option value="base">Pizza Bases</option>
            <option value="sauce">Sauces</option>
            <option value="cheese">Cheeses</option>
            <option value="vegetable">Vegetables</option>
          </select>
        </div>

        <label className="inline-flex items-center text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2 h-4 w-4"
          />
          Show Low Stock Only ({lowStockCount})
        </label>
      </div>

      {/* Table */}
      {loading && inventory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading inventory data...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
          No inventory items found matching the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const isEditing = editingId === item._id;

                const lowStock = isItemLowStock(item);

                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      lowStock ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.linkedPizzaOption && (
                        <div className="text-xs text-gray-400">
                          Linked Option: {item.linkedPizzaOption.name} (₹{item.linkedPizzaOption.basePrice})
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                            autoFocus
                          />
                          <span className="text-xs text-gray-500">{item.unit || 'units'}</span>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-900">
                          {item.currentStock}{' '}
                          <span className="text-xs font-normal text-gray-500">
                            {item.unit || 'units'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.lowStockThreshold} {item.unit || 'units'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {lowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveStock(item._id)}
                            disabled={updating}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                          >
                            {updating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updating}
                            className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-semibold disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-gray-700 hover:text-black font-semibold text-sm underline"
                        >
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
