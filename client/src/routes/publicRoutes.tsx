import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import UserLayout from "../pages/layout";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const About = lazy(() => import("../pages/about"));
const Login = lazy(() => import("../pages/auth/login"));
const Signup = lazy(() => import("../pages/auth/signup"));
const AdminLogin = lazy(() => import("../pages/auth/adminLogin"));

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
    path: "/admin-login",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLogin />
      </Suspense>
    ),
  },
];
