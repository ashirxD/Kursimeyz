// Zustand Stores Export
// ======================

// Auth Store - User authentication state
export {
  useAuthStore,
  useUser,
  useToken,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from "./authStore";
export type { User } from "./authStore";

// Sidebar Store - UI sidebar state
export { useSidebarStore, useIsSidebarOpen } from "./sidebarStore";

// Cart Store - Shopping cart state
export {
  useCartStore,
  useCartItems,
  useCartItemsCount,
  useCartTotalItems,
  useCartSubtotal,
  useCartLoading,
  useCartError,
} from "./cartStore";
export type { CartItem } from "./cartStore";

// Checkout Store - Checkout flow state
export {
  useCheckoutStore,
  useShippingAddress,
  usePaymentMethod,
  useCheckoutStep,
  useIsCheckoutProcessing,
  useOrderId,
  useCheckoutError,
} from "./checkoutStore";
export type { ShippingAddress, OrderItem } from "./checkoutStore";
