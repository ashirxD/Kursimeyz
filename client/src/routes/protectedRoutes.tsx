import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import AuthGuard from "../components/AuthGuard";

// Lazy load components
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));
const OrderSuccessPage = lazy(() => import("@/pages/checkout/Success"));
const OrderHistoryPage = lazy(() => import("../pages/OrderHistory"));
const AccountPage = lazy(() => import("../pages/account"));

const page = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
);

// Pages that need a signed-in shopper. They are mounted inside the storefront
// layout in publicRoutes.tsx, not given a layout of their own: two layouts at
// the same path would remount the header and footer on every move between a
// public page and a protected one (shop -> cart), losing their state.
export const protectedPageRoutes = [
  {
    element: <AuthGuard />,
    children: [
      { path: "cart", element: page(<CartPage />) },
      { path: "checkout", element: page(<CheckoutPage />) },
      { path: "order-success", element: page(<OrderSuccessPage />) },
      { path: "orders", element: page(<OrderHistoryPage />) },
      { path: "account", element: page(<AccountPage />) },
    ],
  },
];
