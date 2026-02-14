import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLayout from '../pages/admin/index';

const AdminDashboard = lazy(() => import('../pages/admin/dashboard/index'));
const AdminChairs = lazy(() => import('../pages/admin/chairs/index'));
const AdminTables = lazy(() => import('../pages/admin/tables/index'));

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
            {
                path: 'chairs',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminChairs />
                    </Suspense>
                ),
            },
            {
                path: 'tables',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminTables />
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
