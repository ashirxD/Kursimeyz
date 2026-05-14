import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { adminRoutes } from "./adminRoutes";
import ErrorPage from "../pages/error/ErrorPage";

// Combine all routes
const router = createBrowserRouter([
  {
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
