import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  quantity: number;
}

interface CartState {
  // State
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  lastSynced: number | null;

  // Getters (computed values)
  get itemsCount(): number;
  get totalItems(): number;
  get subtotal(): number;

  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setItems: (items: CartItem[]) => void;
  syncWithServer: (serverItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,
      lastSynced: null,

      // Computed getters
      get itemsCount() {
        return get().items.length;
      },
      get totalItems() {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      },

      // Actions
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { ...item, quantity: item.quantity || 1 } as CartItem,
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], lastSynced: Date.now() });
      },

      incrementItem: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity + 1);
        }
      },

      decrementItem: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity - 1);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setItems: (items) => set({ items }),

      syncWithServer: (serverItems) => {
        set({ items: serverItems, lastSynced: Date.now() });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        lastSynced: state.lastSynced,
      }),
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemsCount = () => useCartStore((state) => state.itemsCount);
export const useCartTotalItems = () => useCartStore((state) => state.totalItems);
export const useCartSubtotal = () => useCartStore((state) => state.subtotal);
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);
