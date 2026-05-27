import { useState, useEffect } from 'react';
import type { PendingReviewOrder, PendingReviewProduct } from '@/hooks/usePendingReviews';
import { resolveImageUrl } from '@/utils/imageUrl';

interface ReviewDraft {
  rating: number;
  comment: string;
}

interface OrderReviewModalProps {
  order: PendingReviewOrder;
  onClose: () => void;
  onSubmit: (
    orderId: string,
    reviews: Array<{ productId: string; rating: number; comment?: string }>
  ) => Promise<void>;
  onSnooze: (orderId: string) => Promise<void>;
  onSkip: (orderId: string) => Promise<void>;
  isSubmitting?: boolean;
  isSnoozing?: boolean;
  isSkipping?: boolean;
}

export default function OrderReviewModal({
  order,
  onClose,
  onSubmit,
  onSnooze,
  onSkip,
  isSubmitting = false,
  isSnoozing = false,
  isSkipping = false,
}: OrderReviewModalProps) {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [error, setError] = useState('');

  const products = order.products;
  const currentProduct: PendingReviewProduct | undefined = products[step];
  const isLastStep = step === products.length - 1;
  const currentDraft = currentProduct ? drafts[currentProduct.productId] : undefined;

  useEffect(() => {
    setStep(0);
    setDrafts({});
    setError('');
  }, [order.orderId]);

  const setCurrentRating = (rating: number) => {
    if (!currentProduct) return;
    setDrafts((prev) => ({
      ...prev,
      [currentProduct.productId]: {
        rating,
        comment: prev[currentProduct.productId]?.comment || '',
      },
    }));
  };

  const setCurrentComment = (comment: string) => {
    if (!currentProduct) return;
    setDrafts((prev) => ({
      ...prev,
      [currentProduct.productId]: {
        rating: prev[currentProduct.productId]?.rating || 0,
        comment,
      },
    }));
  };

  const handleNext = () => {
    if (!currentDraft?.rating) {
      setError('Please select a star rating before continuing.');
      return;
    }
    setError('');
    if (isLastStep) {
      handleSubmitAll();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSubmitAll = async () => {
    const missing = products.filter((p) => !drafts[p.productId]?.rating);
    if (missing.length > 0) {
      setError('Please rate all products before submitting.');
      return;
    }

    setError('');
    const reviews = products.map((p) => ({
      productId: p.productId,
      rating: drafts[p.productId].rating,
      comment: drafts[p.productId].comment?.trim() || undefined,
    }));

    try {
      await onSubmit(order.orderId, reviews);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to submit reviews. Please try again.');
    }
  };

  const handleSnooze = async () => {
    try {
      await onSnooze(order.orderId);
      onClose();
    } catch {
      setError('Could not snooze. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      await onSkip(order.orderId);
      onClose();
    } catch {
      setError('Could not skip. Please try again.');
    }
  };

  if (!currentProduct) return null;

  const isBusy = isSubmitting || isSnoozing || isSkipping;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1a2f1a] px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black tracking-tight text-lg leading-none">
              Rate Your Order
            </h3>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
              Order #{order.orderShortId} · {step + 1} of {products.length}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="size-20 rounded-2xl bg-[#f4f5f0] overflow-hidden shrink-0">
              <img
                src={resolveImageUrl(currentProduct.image)}
                alt={currentProduct.name}
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-black text-[#1a2f1a] truncate">{currentProduct.name}</h4>
              <p className="text-xs font-bold text-[#1a2f1a]/40 uppercase tracking-widest mt-1">
                Qty: {currentProduct.quantity}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-[#1a2f1a] uppercase tracking-widest mb-3">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCurrentRating(star)}
                  disabled={isBusy}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-4xl ${
                      (currentDraft?.rating || 0) >= star ? 'text-amber-400' : 'text-slate-200'
                    }`}
                    style={{
                      fontVariationSettings:
                        (currentDraft?.rating || 0) >= star ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[10px] font-black text-[#1a2f1a] uppercase tracking-widest mb-2">
              Review (Optional)
            </label>
            <textarea
              value={currentDraft?.comment || ''}
              onChange={(e) => setCurrentComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              maxLength={500}
              disabled={isBusy}
              className="w-full bg-[#f4f5f0]/50 px-4 py-3 rounded-xl border border-[#1a2f1a]/10 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/20 font-medium text-sm text-[#1a2f1a] placeholder:text-[#1a2f1a]/30 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={isBusy}
              className="w-full bg-[#ff6b35] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#f05a28] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/40 border-t-white"></span>
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit All Reviews'
              ) : (
                <>
                  Next Product
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSnooze}
                disabled={isBusy}
                className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#1a2f1a]/60 bg-[#1a2f1a]/5 hover:bg-[#1a2f1a]/10 transition-colors disabled:opacity-50"
              >
                {isSnoozing ? 'Snoozing...' : 'Remind Me Later'}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isBusy}
                className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#1a2f1a]/60 bg-[#1a2f1a]/5 hover:bg-[#1a2f1a]/10 transition-colors disabled:opacity-50"
              >
                {isSkipping ? 'Skipping...' : "Don't Ask Again"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
