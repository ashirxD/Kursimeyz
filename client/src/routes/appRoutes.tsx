import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { adminRoutes } from "./adminRoutes";

// Combine all routes
const router = createBrowserRouter([
  ...protectedRoutes,
  ...publicRoutes,
  ...adminRoutes,
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
