import React, { useState } from 'react';
import { useConfirmPayment } from '@/hooks/useAdminOrders';
import api from '@/utils/Axios';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  /** The label already shown on the row this was opened from. */
  orderLabel: string;
}

export default function PaymentConfirmationModal({ isOpen, onClose, orderId, orderLabel }: PaymentConfirmationModalProps) {
  const { confirmPayment, isPending } = useConfirmPayment();
  const [paymentId, setPaymentId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const resetForm = () => {
    setPaymentId('');
    setPaymentDate('');
    setReceiptUrl('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setMessage({ type: '', text: '' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage({ type: '', text: '' });

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData);

      setReceiptUrl(response.data.url);
    } catch {
      setReceiptUrl('');
      setMessage({ type: 'error', text: 'Failed to upload receipt image' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (isUploading) return;

    try {
      await confirmPayment({
        orderId,
        payload: {
          paymentId,
          receiptUrl,
          paymentDate,
        },
      });
      setMessage({ type: 'success', text: 'Payment confirmed successfully!' });
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to confirm payment',
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-sm transition-all duration-300">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-forest-moss px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <h3 className="text-white font-black tracking-tight text-lg leading-none">Confirm Payment</h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                Order {orderLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-forest-moss-light/70 mb-5 leading-relaxed">
            Mark this order as paid. You may optionally provide payment details below for your records.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                Payment ID / Transaction Ref
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="e.g. TXN-12345678"
                className="w-full bg-oatmeal/30 px-4 py-3 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm text-forest-moss placeholder:text-forest-moss/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                Date of Payment
              </label>
              <input
                type="datetime-local"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-oatmeal/30 px-4 py-3 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm text-forest-moss"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                Receipt Screenshot (Optional)
              </label>
              <div className="border-2 border-dashed border-forest-moss/20 rounded-2xl p-4 text-center hover:bg-forest-moss/5 transition-colors cursor-pointer relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                {previewUrl ? (
                  <div className="relative h-24 w-full">
                    <img src={previewUrl} alt="Receipt Preview" className="h-full w-full object-contain rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white text-xs font-bold">
                        {isUploading ? 'Uploading...' : 'Change Image'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-4 text-forest-moss/50">
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform text-clay">
                      upload_file
                    </span>
                    <span className="text-xs font-bold">Click or drag image to upload</span>
                  </div>
                )}
              </div>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                <span className="material-symbols-outlined text-lg">
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span className="text-xs font-bold">{message.text}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-forest-moss bg-forest-moss/5 hover:bg-forest-moss/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isUploading}
                className="flex-[2] bg-forest-moss text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/40 border-t-white"></span>
                    Confirming...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified</span>
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
