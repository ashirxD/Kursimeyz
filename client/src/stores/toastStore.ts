import { create } from 'zustand';
import { parseApiError } from '@/utils/apiError';

export type ToastKind = 'error' | 'success' | 'info';

export interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
    /** Shown small under an error, for the person to quote if they contact us. */
    reference?: string;
}

interface ToastState {
    toasts: ToastItem[];
    show: (toast: Omit<ToastItem, 'id'>) => void;
    dismiss: (id: number) => void;
}

// Errors are read more slowly than confirmations, and may carry a reference to copy.
const DURATION: Record<ToastKind, number> = { error: 8000, info: 5000, success: 3500 };

// The same message twice in a row — a retried query, a double click — is one message.
const DEDUPE_WINDOW_MS = 4000;
const MAX_VISIBLE = 4;

let nextId = 1;
const recent = new Map<string, number>();

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    show: (toast) => {
        const key = `${toast.kind}:${toast.message}`;
        const now = Date.now();
        const last = recent.get(key);

        if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return;
        recent.set(key, now);

        const id = nextId++;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-MAX_VISIBLE) }));

        window.setTimeout(() => get().dismiss(id), DURATION[toast.kind]);
    },

    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

/**
 * Show a message from anywhere — a component, a hook, a plain utility:
 *
 *   toast.error("We couldn't save that.");
 *   toast.fromError(error, 'Failed to save phone number');
 */
export const toast = {
    error: (message: string, reference?: string) =>
        useToastStore.getState().show({ kind: 'error', message, reference }),

    success: (message: string) => useToastStore.getState().show({ kind: 'success', message }),

    info: (message: string) => useToastStore.getState().show({ kind: 'info', message }),

    /** Reads a failed request and shows what a person should be told about it. */
    fromError: (error: unknown, fallback?: string) => {
        const info = parseApiError(error);
        // A cancelled request is not a failure.
        if (!info.message) return;

        const message = info.kind === 'unknown' && fallback ? fallback : info.message;
        useToastStore.getState().show({ kind: 'error', message, reference: info.reference });
    },
};
