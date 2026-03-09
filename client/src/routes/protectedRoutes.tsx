import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";
import AuthGuard from "../components/AuthGuard";
import { Navigate } from "react-router-dom";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const ChairsPage = lazy(() => import("../pages/chairs"));
const TablesPage = lazy(() => import("../pages/tables"));
const SofasPage = lazy(() => import("../pages/sofas"));
const CartPage = lazy(() => import("../pages/cart"));
const CheckoutPage = lazy(() => import("../pages/checkout"));
const OrderSuccessPage = lazy(() => import("@/pages/checkout/Success"));

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
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            ),
          },
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
