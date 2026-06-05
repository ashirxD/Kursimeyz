import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { adminRoutes } from "./adminRoutes";
import ErrorPage from "../pages/error/ErrorPage";
import QuickAuthModal from "../pages/auth/QuickAuthModal";
import PhoneRequiredModal from "@/components/PhoneRequiredModal";

const AppLayout = () => {
  return (
    <>
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
      ...protectedRoutes,
      ...publicRoutes,
      ...adminRoutes,
    ],
  },
]);


const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
