import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';

// Combine all routes
const router = createBrowserRouter([
    ...publicRoutes,
    ...protectedRoutes,
    ...adminRoutes,
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
