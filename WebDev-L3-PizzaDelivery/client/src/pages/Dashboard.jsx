import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import * as pizzaApi from '../api/pizza.api';

const CATEGORY_TITLES = {
  base: { title: 'Pizza Bases (Crusts)', count: 5, icon: '🥖' },
  sauce: { title: 'Flavorful Sauces', count: 5, icon: '🍅' },
  cheese: { title: 'Artisanal Cheeses', count: 4, icon: '🧀' },
  vegetable: { title: 'Fresh Vegetables (Optional in builder)', count: 7, icon: '🥦' },
};

const Dashboard = () => {
  const [groupedOptions, setGroupedOptions] = useState({
    base: [],
    sauce: [],
    cheese: [],
    vegetable: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await pizzaApi.getAllPizzaOptions();
        if (res.data?.grouped) {
          setGroupedOptions(res.data.grouped);
        } else if (res.data?.options) {
          const grouped = {
            base: res.data.options.filter((o) => o.category === 'base'),
            sauce: res.data.options.filter((o) => o.category === 'sauce'),
            cheese: res.data.options.filter((o) => o.category === 'cheese'),
            vegetable: res.data.options.filter((o) => o.category === 'vegetable'),
          };
          setGroupedOptions(grouped);
        }
      } catch (err) {
        setError(
          err.response?.data?.message
            || 'Failed to load pizza options catalogue. Please ensure the database is seeded.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Pizza Ingredients & Options Catalogue
            </h1>
            <p className="text-gray-600 mt-1">
              Browse all fresh ingredients available for custom pizza creation.
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            🍕 Build Your Custom Pizza →
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="text-gray-500 font-medium">Loading pizza customization options...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(CATEGORY_TITLES).map(([catKey, catMeta]) => {
              const items = groupedOptions[catKey] || [];
              return (
                <section key={catKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{catMeta.icon}</span>
                      <h2 className="text-xl font-bold text-gray-900">{catMeta.title}</h2>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {items.length} Options
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No options found in this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {items.map((item) => (
                        <div
                          key={item._id || item.name}
                          className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition bg-gray-50/50"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                              <span className="font-extrabold text-primary text-base whitespace-nowrap">
                                ₹{item.basePrice}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {item.description || 'Delicious pizza component freshly prepared.'}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-500 capitalize">{item.category}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-semibold ${
                                item.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
