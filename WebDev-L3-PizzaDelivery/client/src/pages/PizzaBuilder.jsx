import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPizzaOptions } from '../api/pizza.api';
import { useOrder } from '../context/OrderContext';
import StepBase from '../components/builder/StepBase';
import StepSauce from '../components/builder/StepSauce';
import StepCheese from '../components/builder/StepCheese';
import StepVegetables from '../components/builder/StepVegetables';
import Navbar from '../components/common/Navbar';

const PizzaBuilder = () => {
  const navigate = useNavigate();
  const {
    activeStep,
    setActiveStep,
    displayTotal,
  } = useOrder();

  const [optionsByCategory, setOptionsByCategory] = useState({
    base: [],
    sauce: [],
    cheese: [],
    vegetable: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        const data = await getAllPizzaOptions();
        if (data && data.success && data.data) {
          if (data.data.grouped) {
            setOptionsByCategory(data.data.grouped);
          } else if (data.data.categories) {
            setOptionsByCategory(data.data.categories);
          } else if (Array.isArray(data.data.options)) {
            setOptionsByCategory({
              base: data.data.options.filter((o) => o.category === 'base'),
              sauce: data.data.options.filter((o) => o.category === 'sauce'),
              cheese: data.data.options.filter((o) => o.category === 'cheese'),
              vegetable: data.data.options.filter((o) => o.category === 'vegetable'),
            });
          }
        }
      } catch (err) {
        setError('Failed to load pizza ingredients catalogue. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, []);

  const steps = [
    { number: 1, title: 'Crust Base' },
    { number: 2, title: 'Sauce' },
    { number: 3, title: 'Cheese' },
    { number: 4, title: 'Vegetables' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => {
              const isCurrent = activeStep === step.number;
              const isDone = activeStep > step.number;
              return (
                <div key={step.number} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone ? '✓' : step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCurrent ? 'text-red-600' : isDone ? 'text-emerald-700' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Display Total Banner */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <span className="text-sm font-medium text-gray-600">
            Estimated Total (Authoritative price calculated on server):
          </span>
          <span className="text-xl font-bold text-gray-900">₹{displayTotal}</span>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20 text-gray-500">
            Loading ingredients catalogue...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            {activeStep === 1 && (
              <StepBase
                options={optionsByCategory.base || []}
                onNext={() => setActiveStep(2)}
              />
            )}

            {activeStep === 2 && (
              <StepSauce
                options={optionsByCategory.sauce || []}
                onBack={() => setActiveStep(1)}
                onNext={() => setActiveStep(3)}
              />
            )}

            {activeStep === 3 && (
              <StepCheese
                options={optionsByCategory.cheese || []}
                onBack={() => setActiveStep(2)}
                onNext={() => setActiveStep(4)}
              />
            )}

            {activeStep === 4 && (
              <StepVegetables
                options={optionsByCategory.vegetable || []}
                onBack={() => setActiveStep(3)}
                onComplete={() => navigate('/order-summary')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PizzaBuilder;
