import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { createRazorpayOrder, verifyPayment } from '../api/order.api';
import Navbar from '../components/common/Navbar';

const OrderSummary = () => {
  const navigate = useNavigate();
  const {
    base,
    sauce,
    cheese,
    vegetables,
    displayTotal,
    resetBuilder,
  } = useOrder();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // If essential ingredients are not selected, offer redirect back to builder
  if (!base || !sauce || !cheese) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Incomplete Pizza Customization</h2>
            <p className="text-gray-600 mb-6">
              Please choose a crust base, sauce, and cheese before reviewing your order.
            </p>
            <button
              type="button"
              onClick={() => navigate('/builder')}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Go to Pizza Builder →
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handlePayNow = async () => {
    try {
      setProcessing(true);
      setError(null);

      // 1. Initiate order creation on server (server calculates authoritative price)
      const orderPayload = {
        base: base._id,
        sauce: sauce._id,
        cheese: cheese._id,
        vegetables: vegetables.map((v) => v._id),
      };

      const createRes = await createRazorpayOrder(orderPayload);
      if (!createRes || !createRes.success || !createRes.data) {
        throw new Error(createRes?.message || 'Failed to initialize order on server');
      }

      const { razorpayOrderId, amount, currency, orderId } = createRes.data;

      // 2. Check if Razorpay SDK is available in window
      if (typeof window.Razorpay === 'function') {
        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

        const options = {
          key: rzpKey,
          amount,
          currency: currency || 'INR',
          name: 'Pizza Delivery Application',
          description: 'Custom Handcrafted Pizza Order',
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              // 3. Server-side payment verification
              const verifyRes = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes && verifyRes.success) {
                resetBuilder();
                setSuccessInfo({
                  orderId,
                  message: 'Payment verified and order confirmed successfully!',
                });
              } else {
                throw new Error(verifyRes?.message || 'Payment signature verification failed');
              }
            } catch (vErr) {
              setError(vErr.response?.data?.message || vErr.message || 'Payment verification failed');
            }
          },
          prefill: {},
          theme: { color: '#E63946' },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', (resp) => {
          setError(`Payment failed: ${resp.error.description}`);
        });
        razorpayInstance.open();
      } else {
        // Test mode fallback note when Razorpay script is not externally loaded
        setError(
          `Razorpay test order created (Order ID: ${orderId}, Razorpay ID: ${razorpayOrderId}). `
          + 'Razorpay client SDK is awaiting external network connection or automated verification.',
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message
        || err.message
        || 'An error occurred while creating your order. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Summary</h1>
              <p className="text-sm text-gray-500 mt-1">Review your customized pizza before payment</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/builder')}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Edit Pizza ↺
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {successInfo && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-xl mb-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="font-bold text-xl mb-1 text-emerald-900">Order Confirmed!</h3>
              <p className="text-sm mb-2 text-emerald-700">{successInfo.message}</p>
              <p className="text-xs text-emerald-600 mb-6 font-mono font-semibold">
                Order ID: #{successInfo.orderId}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/order-status/${successInfo.orderId}`)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm transition"
                >
                  Track Live Order Status →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-orders')}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  View My Orders
                </button>
              </div>
            </div>
          )}

          {!successInfo && (
            <div className="space-y-6">
              {/* Ingredients breakdown */}
              <div className="divide-y divide-gray-100">
                <div className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400 block">Crust Base</span>
                    <span className="font-medium text-gray-900">{base.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{base.basePrice}</span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400 block">Sauce Layer</span>
                    <span className="font-medium text-gray-900">{sauce.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{sauce.basePrice}</span>
                </div>

                <div className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400 block">Cheese</span>
                    <span className="font-medium text-gray-900">{cheese.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{cheese.basePrice}</span>
                </div>

                <div className="py-3 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-400 block">Vegetable Toppings</span>
                    {vegetables.length === 0 ? (
                      <span className="text-sm text-gray-500 italic">None selected</span>
                    ) : (
                      <ul className="text-sm text-gray-800 mt-1 space-y-1">
                        {vegetables.map((v) => (
                          <li key={v._id} className="flex items-center gap-2">
                            <span>• {v.name}</span>
                            <span className="text-xs text-gray-500">(₹{v.basePrice})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{vegetables.reduce((acc, v) => acc + (v.basePrice || 0), 0)}
                  </span>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                <div>
                  <span className="font-bold text-gray-900 text-lg block">Total Amount</span>
                  <span className="text-xs text-gray-500">Includes all authentic ingredients & taxes</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-red-600">₹{displayTotal}</span>
                  <span className="text-xs text-gray-400 block">INR</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between items-stretch sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/builder')}
                  className="px-6 py-2.5 text-center text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  ← Modify Selections
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handlePayNow}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? 'Connecting Gateway...' : 'Pay with Razorpay →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderSummary;
