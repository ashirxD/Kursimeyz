import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const ChairsPage = lazy(() => import("../pages/chairs"));
const TablesPage = lazy(() => import("../pages/tables"));
const SofasPage = lazy(() => import("../pages/sofas"));

export const protectedRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
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
];
