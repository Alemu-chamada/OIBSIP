import { useState, useEffect, useRef, useCallback } from 'react';
import { getOrderStatus } from '../api/order.api';

const POLL_INTERVAL_MS = 5000;
const TERMINAL_STATUS = 'Sent to Delivery';

/**
 * Custom hook for live order status polling.
 * Polls GET /api/orders/:orderId/status every 5 seconds.
 * Automatically stops polling when order reaches 'Sent to Delivery' or on unmount.
 * Plan Reference: project_plan.md §4.1 (FR-U16), §6.6, §7.2
 *
 * @param {string} orderId - Target order ID
 * @returns {Object} { order, loading, error, isPolling, refetch }
 */
const useOrderStatus = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchStatus = useCallback(async (isInitial = false) => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    try {
      if (isInitial) {
        setLoading(true);
      }
      const res = await getOrderStatus(orderId);
      if (!isMountedRef.current) return;

      if (res && res.success) {
        setOrder(res.data);
        setError(null);

        // Check if final terminal status reached
        if (res.data.orderStatus === TERMINAL_STATUS) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsPolling(false);
        }
      } else {
        throw new Error(res?.message || 'Failed to fetch order status');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      const errMsg = err.response?.data?.message || err.message || 'Error checking order status';
      setError(errMsg);

      // Stop polling on 401, 403, 404 to avoid repeated failed requests
      const status = err.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsPolling(false);
      }
    } finally {
      if (isMountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return undefined;
    }

    // 1. Initial immediate fetch
    fetchStatus(true);

    // 2. Start polling every 5 seconds
    setIsPolling(true);
    timerRef.current = setInterval(() => {
      fetchStatus(false);
    }, POLL_INTERVAL_MS);

    // 3. Cleanup on unmount or orderId change
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [orderId, fetchStatus]);

  const refetch = useCallback(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  return {
    order,
    loading,
    error,
    isPolling,
    refetch,
  };
};

export default useOrderStatus;
