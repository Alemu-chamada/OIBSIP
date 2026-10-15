import React, { createContext, useContext, useState, useMemo } from 'react';

const OrderContext = createContext(null);

/**
 * Order Context Provider
 * Stores pizza wizard selections across steps and computes display total.
 * Note: Display totals are for presentation only; backend calculates authoritative price.
 * Plan Reference: project_plan.md §11.3
 */
export const OrderProvider = ({ children }) => {
  const [base, setBase] = useState(null);
  const [sauce, setSauce] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  const toggleVegetable = (vegOption) => {
    setVegetables((prev) => {
      const exists = prev.some((v) => v._id === vegOption._id);
      if (exists) {
        return prev.filter((v) => v._id !== vegOption._id);
      }
      return [...prev, vegOption];
    });
  };

  const resetBuilder = () => {
    setBase(null);
    setSauce(null);
    setCheese(null);
    setVegetables([]);
    setActiveStep(1);
  };

  const displayTotal = useMemo(() => {
    let sum = 0;
    if (base && typeof base.basePrice === 'number') sum += base.basePrice;
    if (sauce && typeof sauce.basePrice === 'number') sum += sauce.basePrice;
    if (cheese && typeof cheese.basePrice === 'number') sum += cheese.basePrice;
    vegetables.forEach((v) => {
      if (v && typeof v.basePrice === 'number') sum += v.basePrice;
    });
    return sum;
  }, [base, sauce, cheese, vegetables]);

  const value = {
    base,
    setBase,
    sauce,
    setSauce,
    cheese,
    setCheese,
    vegetables,
    toggleVegetable,
    activeStep,
    setActiveStep,
    displayTotal,
    resetBuilder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
