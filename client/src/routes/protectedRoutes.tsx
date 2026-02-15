import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import UserLayout from '../pages/layout';

// Lazy load components
const Dashboard = lazy(() => import('../pages/dashboard'));

export const protectedRoutes = [
    {
        path: '/',
        element: <UserLayout />,
        children: [
            {
                path: 'dashboard',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <Dashboard />
                    </Suspense>
                ),
            },
        ],
    },
];
