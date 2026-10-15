import React from 'react';

const STAGES = [
  {
    key: 'Order Received',
    label: 'Order Received',
    icon: '📝',
    description: 'Payment confirmed & sent to pizzeria',
  },
  {
    key: 'In Kitchen',
    label: 'In Kitchen',
    icon: '🔥',
    description: 'Fresh dough hand-tossed & wood-fired',
  },
  {
    key: 'Sent to Delivery',
    label: 'Sent to Delivery',
    icon: '🛵',
    description: 'Hot pizza on the way to your door',
  },
];

/**
 * Visual 3-stage order status progression component.
 * Lifecycle: Order Received -> In Kitchen -> Sent to Delivery
 * Plan Reference: project_plan.md §4.1 (FR-U16), §6.6
 *
 * @param {Object} props
 * @param {string} props.currentStatus - Persisted order status value
 */
const OrderStatusProgress = ({ currentStatus }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isTerminal = currentStatus === 'Sent to Delivery';

  const progressPercentage = activeIndex === 0 ? 0 : activeIndex === 1 ? 50 : 100;

  return (
    <div className="w-full py-4">
      {/* Progress Track */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1.5 bg-red-600 -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="relative z-10 flex justify-between items-center">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            let circleClass = 'bg-gray-100 text-gray-400 border-2 border-gray-300';
            if (isCompleted) {
              circleClass = 'bg-green-600 text-white border-2 border-green-600 shadow-sm';
            } else if (isCurrent) {
              circleClass = 'bg-red-600 text-white border-4 border-red-200 shadow-md ring-4 ring-red-50 animate-pulse';
            }

            return (
              <div key={stage.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${circleClass}`}
                >
                  {isCompleted ? '✓' : stage.icon}
                </div>
                <div className="mt-3 text-center px-1">
                  <span
                    className={`block text-xs sm:text-sm font-bold ${
                      isCurrent
                        ? 'text-red-600'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="hidden sm:block text-[11px] text-gray-500 mt-0.5 max-w-[140px] mx-auto leading-tight">
                    {stage.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status Callout Banner */}
      <div
        className={`rounded-xl p-4 text-center border transition-all ${
          isTerminal
            ? 'bg-green-50 border-green-200 text-green-900'
            : 'bg-red-50 border-red-100 text-gray-800'
        }`}
      >
        {isTerminal ? (
          <div>
            <div className="text-xl mb-1">🎉</div>
            <h4 className="font-bold text-green-900 text-base">Your pizza is on the way!</h4>
            <p className="text-xs text-green-700 mt-1">
              The delivery courier has collected your freshly baked pizza. Polling has completed.
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
              </span>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Live Status: {currentStatus}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {STAGES[activeIndex]?.description}. Status updates automatically every 5 seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusProgress;
