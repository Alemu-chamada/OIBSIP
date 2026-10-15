import React from 'react';
import { useOrder } from '../../context/OrderContext';

const StepBase = ({ options, onNext }) => {
  const { base, setBase } = useOrder();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Step 1: Choose Your Crust Base</h2>
        <p className="text-gray-600 mt-1">Select one base for your custom pizza (5 authentic choices available).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = base && base._id === option._id;
          return (
            <div
              key={option._id}
              onClick={() => setBase(option)}
              className={`cursor-pointer rounded-xl border-2 p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/20'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">{option.name}</h3>
                  <span className="font-bold text-red-600">₹{option.basePrice}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{option.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{isSelected ? '✓ Selected' : 'Click to select'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!base}
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next: Choose Sauce →
        </button>
      </div>
    </div>
  );
};

export default StepBase;
