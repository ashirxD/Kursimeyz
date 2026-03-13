import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutState {
  // Shipping Address
  shippingAddress: ShippingAddress;

  // Payment
  paymentMethod: "Cash" | "Card";
  cardInfo: {
    number: string;
    expiry: string;
    cvc: string;
  };

  // Order Summary
  orderItems: OrderItem[];
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;

  // Status
  isProcessing: boolean;
  currentStep: 1 | 2 | 3;
  orderId: string | null;
  error: string | null;

  // Getters
  get isAddressValid(): boolean;

  // Actions
  setShippingAddress: (address: Partial<ShippingAddress>) => void;
  setPaymentMethod: (method: "Cash" | "Card") => void;
  setCardInfo: (info: Partial<CheckoutState["cardInfo"]>) => void;
  setOrderItems: (items: OrderItem[]) => void;
  setPrices: (itemsPrice: number, shippingPrice: number) => void;
  setProcessing: (isProcessing: boolean) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setOrderId: (orderId: string | null) => void;
  setError: (error: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCheckout: () => void;
  clearError: () => void;
}

const initialAddress: ShippingAddress = {
  street: "",
  city: "",
  zipCode: "",
  phone: "",
};

const initialCardInfo = {
  number: "4242 4242 4242 4242",
  expiry: "12/26",
  cvc: "123",
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      shippingAddress: { ...initialAddress },
      paymentMethod: "Card",
      cardInfo: { ...initialCardInfo },
      orderItems: [],
      itemsPrice: 0,
      shippingPrice: 0,
      totalPrice: 0,
      isProcessing: false,
      currentStep: 1,
      orderId: null,
      error: null,

      // Computed getter
      get isAddressValid() {
        const { street, city, zipCode, phone } = get().shippingAddress;
        return !!(street.trim() && city.trim() && zipCode.trim() && phone.trim());
      },

      // Actions
      setShippingAddress: (address) =>
        set((state) => ({
          shippingAddress: { ...state.shippingAddress, ...address },
        })),

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      setCardInfo: (info) =>
        set((state) => ({
          cardInfo: { ...state.cardInfo, ...info },
        })),

      setOrderItems: (orderItems) => {
        const itemsPrice = orderItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        const shippingPrice = itemsPrice > 0 ? 50 : 0;
        set({
          orderItems,
          itemsPrice,
          shippingPrice,
          totalPrice: itemsPrice + shippingPrice,
        });
      },

      setPrices: (itemsPrice, shippingPrice) =>
        set({
          itemsPrice,
          shippingPrice,
          totalPrice: itemsPrice + shippingPrice,
        }),

      setProcessing: (isProcessing) => set({ isProcessing }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setOrderId: (orderId) => set({ orderId }),
      setError: (error) => set({ error }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3) as 1 | 2 | 3,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as 1 | 2 | 3,
        })),

      resetCheckout: () =>
        set({
          shippingAddress: { ...initialAddress },
          paymentMethod: "Card",
          cardInfo: { ...initialCardInfo },
          orderItems: [],
          itemsPrice: 0,
          shippingPrice: 0,
          totalPrice: 0,
          isProcessing: false,
          currentStep: 1,
          orderId: null,
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "checkout-storage",
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod,
        currentStep: state.currentStep,
      }),
    }
  )
);

// Selector hooks for better performance
export const useShippingAddress = () =>
  useCheckoutStore((state) => state.shippingAddress);
export const usePaymentMethod = () =>
  useCheckoutStore((state) => state.paymentMethod);
export const useCheckoutStep = () =>
  useCheckoutStore((state) => state.currentStep);
export const useIsCheckoutProcessing = () =>
  useCheckoutStore((state) => state.isProcessing);
export const useOrderId = () => useCheckoutStore((state) => state.orderId);
export const useCheckoutError = () =>
  useCheckoutStore((state) => state.error);
