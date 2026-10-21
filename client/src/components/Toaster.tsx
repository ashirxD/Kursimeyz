import { useToastStore, type ToastKind } from '@/stores/toastStore';

const STYLES: Record<ToastKind, { icon: string; badge: string }> = {
    error: { icon: 'error', badge: 'bg-[#ff311b]/10 text-[#ff311b]' },
    success: { icon: 'check_circle', badge: 'bg-sage-soft text-forest-moss' },
    info: { icon: 'info', badge: 'bg-oatmeal text-forest-moss' },
};

/**
 * The app's messages, stacked in a corner. Mounted once, at the root, so a failure
 * anywhere — a hook, a mutation, a plain function — can say so without the page
 * it happened on having to make room for it.
 *
 * Errors are announced to screen readers straight away (`role="alert"`); the rest
 * politely, so they never interrupt.
 */
export default function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const dismiss = useToastStore((state) => state.dismiss);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            className="fixed z-[100] inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px] flex flex-col gap-2.5 pointer-events-none"
        >
            {toasts.map((item) => {
                const style = STYLES[item.kind];

                return (
                    <div
                        key={item.id}
                        role={item.kind === 'error' ? 'alert' : 'status'}
                        className="toast-in pointer-events-auto flex items-start gap-3 rounded-2xl bg-white border border-forest-moss/10 shadow-medium pl-3 pr-2 py-3"
                    >
                        <span
                            className={`mt-0.5 size-8 shrink-0 rounded-full flex items-center justify-center ${style.badge}`}
                        >
                            <span
                                className="material-symbols-outlined !text-[18px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                {style.icon}
                            </span>
                        </span>

                        <div className="min-w-0 flex-1 pt-1">
                            <p className="text-[13px] font-semibold leading-snug text-forest-moss">
                                {item.message}
                            </p>
                            {item.reference && (
                                <p className="mt-1 text-[11px] font-medium text-forest-moss/50">
                                    Reference:{' '}
                                    <span className="font-mono font-bold text-forest-moss/70 select-all">
                                        {item.reference}
                                    </span>
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => dismiss(item.id)}
                            aria-label="Dismiss message"
                            className="size-7 shrink-0 rounded-full flex items-center justify-center text-forest-moss/40 hover:bg-oatmeal hover:text-forest-moss transition-colors"
                        >
                            <span className="material-symbols-outlined !text-[16px]">close</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
