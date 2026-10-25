import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { adminRoutes } from "./adminRoutes";
import ErrorPage from "../pages/error/ErrorPage";
import QuickAuthModal from "../pages/auth/QuickAuthModal";
import PhoneRequiredModal from "@/components/PhoneRequiredModal";
import ScrollManager from "@/components/ScrollManager";
import AdminRedirect from "@/components/AdminRedirect";

const AppLayout = () => {
  return (
    <>
      <ScrollManager />
      <Outlet />
      <QuickAuthModal />
      <PhoneRequiredModal />
    </>
  );
};

// Combine all routes
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Everything a customer can see. A saved admin session is sent to /admin.
      { element: <AdminRedirect />, children: publicRoutes },
      ...adminRoutes,
    ],
  },
]);


const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
