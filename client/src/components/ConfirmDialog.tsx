import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** What will happen, in plain words. Say what cannot be undone. */
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for things that cannot be taken back. */
  destructive?: boolean;
  isWorking?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks before something that can't be undone. The delete icon on a product card
 * sat a thumb-width from Edit and removed the product on one tap, so a slip
 * erased it (and its history on past orders) with no way back.
 *
 * Focus starts on Cancel so that pressing Enter by reflex is the safe choice.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isWorking = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isWorking) onCancel();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, isWorking, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm"
      onClick={() => {
        if (!isWorking) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-7 border border-white"
      >
        <h3 id="confirm-dialog-title" className="text-xl font-black text-[#1a2f1a] mb-2">
          {title}
        </h3>
        <div
          id="confirm-dialog-message"
          className="text-sm font-medium text-[#1a2f1a]/60 leading-relaxed mb-6"
        >
          {message}
        </div>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isWorking}
            className="flex-1 py-3.5 bg-slate-100 text-[#1a2f1a] rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isWorking}
            className={`flex-1 py-3.5 text-white rounded-full font-black uppercase tracking-widest text-[12px] transition-colors disabled:opacity-50 ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-[#1a2f1a] hover:bg-black"
            }`}
          >
            {isWorking ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
