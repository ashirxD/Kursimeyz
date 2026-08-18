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
const ShopPage = lazy(() => import("../pages/shop"));
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
        // One shop page per kind of product — /shop/chairs, /shop/wardrobes, ...
        path: "shop/:typeSlug",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ShopPage />
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
