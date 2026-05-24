import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useIsAuthenticated } from '@/stores/authStore';
import { usePendingReviews, type PendingReviewOrder } from '@/hooks/usePendingReviews';
import OrderReviewModal from './OrderReviewModal';

interface ReviewPromptContextValue {
  openReviewForOrder: (orderId: string) => void;
}

const ReviewPromptContext = createContext<ReviewPromptContextValue | null>(null);

export const useReviewPrompt = () => {
  const ctx = useContext(ReviewPromptContext);
  if (!ctx) {
    throw new Error('useReviewPrompt must be used within ReviewPromptProvider');
  }
  return ctx;
};

interface ReviewPromptProviderProps {
  children: ReactNode;
}

export default function ReviewPromptProvider({ children }: ReviewPromptProviderProps) {
  const isAuthenticated = useIsAuthenticated();
  const {
    pendingOrders,
    submitReviews,
    snoozeOrder,
    skipOrder,
    isSubmitting,
    isSnoozing,
    isSkipping,
    refetch,
  } = usePendingReviews(isAuthenticated);

  const [activeOrder, setActiveOrder] = useState<PendingReviewOrder | null>(null);
  const [manualOrderId, setManualOrderId] = useState<string | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);

  const openReviewForOrder = useCallback((orderId: string) => {
    setManualOrderId(orderId);
    setDismissedOrderId(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || pendingOrders.length === 0) {
      if (!manualOrderId) setActiveOrder(null);
      return;
    }

    if (manualOrderId) {
      const manual = pendingOrders.find((o) => o.orderId === manualOrderId);
      if (manual) {
        setActiveOrder(manual);
        return;
      }
      setManualOrderId(null);
    }

    const next = pendingOrders.find((o) => o.orderId !== dismissedOrderId);
    setActiveOrder(next || null);
  }, [pendingOrders, manualOrderId, dismissedOrderId, isAuthenticated]);

  const handleClose = () => {
    if (activeOrder) {
      setDismissedOrderId(activeOrder.orderId);
    }
    setActiveOrder(null);
    setManualOrderId(null);
  };

  return (
    <ReviewPromptContext.Provider value={{ openReviewForOrder }}>
      {children}
      {activeOrder && (
        <OrderReviewModal
          order={activeOrder}
          onClose={handleClose}
          onSubmit={async (orderId, reviews) => {
            await submitReviews({ orderId, reviews });
            setManualOrderId(null);
            setDismissedOrderId(null);
            await refetch();
          }}
          onSnooze={async (orderId) => {
            await snoozeOrder({ orderId });
            setManualOrderId(null);
            setDismissedOrderId(null);
          }}
          onSkip={async (orderId) => {
            await skipOrder(orderId);
            setManualOrderId(null);
            setDismissedOrderId(null);
          }}
          isSubmitting={isSubmitting}
          isSnoozing={isSnoozing}
          isSkipping={isSkipping}
        />
      )}
    </ReviewPromptContext.Provider>
  );
}
