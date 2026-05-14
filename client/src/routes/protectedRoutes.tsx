import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";
import AuthGuard from "../components/AuthGuard";

// Lazy load components
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));
const OrderSuccessPage = lazy(() => import("@/pages/checkout/Success"));
const OrderHistoryPage = lazy(() => import("../pages/OrderHistory"));


export const protectedRoutes = [
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <UserLayout />,
        children: [
          {
            path: "cart",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <CartPage />
              </Suspense>
            ),
          },
          {
            path: "checkout",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <CheckoutPage />
              </Suspense>
            ),
          },
          {
            path: "order-success",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <OrderSuccessPage />
              </Suspense>
            ),
          },
          {
            path: "orders",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <OrderHistoryPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];
