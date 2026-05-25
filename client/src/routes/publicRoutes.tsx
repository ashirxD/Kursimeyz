import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const About = lazy(() => import("../pages/about"));
const Login = lazy(() => import("../pages/auth/login"));
const Signup = lazy(() => import("../pages/auth/signup"));
const VerifyOtp = lazy(() => import("../pages/auth/verifyOtp"));
const AdminLogin = lazy(() => import("../pages/auth/adminLogin"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword"));
const ChairsPage = lazy(() => import("../pages/chairs"));
const TablesPage = lazy(() => import("../pages/tables"));
const SofasPage = lazy(() => import("../pages/sofas"));
const TopPicksPage = lazy(() => import("../pages/topPicks"));
const ProductDetailPage = lazy(() => import("../pages/topPicks/detail"));


export const publicRoutes = [
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
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
        path: "about",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <About />
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
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <VerifyOtp />
      </Suspense>
    ),
  },
  {
    path: "/admin-login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
];
