import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLayout from '../pages/admin/layout/index';

const AdminDashboard = lazy(() => import('../pages/admin/dashboard/index'));

export const adminRoutes = [
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: 'dashboard',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminDashboard />
                    </Suspense>
                ),
            },
            // Fallback for /admin to /admin/dashboard
            {
                path: '',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminDashboard />
                    </Suspense>
                ),
            }
        ],
    },
];
