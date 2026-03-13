import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";
import AuthGuard from "../components/AuthGuard";

// Lazy load components
const ChairsPage = lazy(() => import("../pages/chairs"));
const TablesPage = lazy(() => import("../pages/tables"));
const SofasPage = lazy(() => import("../pages/sofas"));
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));
const OrderSuccessPage = lazy(() => import("@/pages/checkout/Success"));
const OrderHistoryPage = lazy(() => import("../pages/OrderHistory"));
const TopPicksPage = lazy(() => import("../pages/topPicks"));
const ProductDetailPage = lazy(() => import("../pages/topPicks/detail"));

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
          {
            path: "top-picks",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <TopPicksPage />
              </Suspense>
            ),
          },
          {
            path: "product/:id",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProductDetailPage />
              </Suspense>
            ),
          },
          {
            path: "shop/chairs",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ChairsPage />
              </Suspense>
            ),
          },
          {
            path: "shop/tables",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <TablesPage />
              </Suspense>
            ),
          },
          {
            path: "shop/sofas",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <SofasPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];
