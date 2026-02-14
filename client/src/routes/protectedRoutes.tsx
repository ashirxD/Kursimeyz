import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('../pages/dashboard'));

export const protectedRoutes = [
    {
        path: '/dashboard',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
            </Suspense>
        ),
    },
];
