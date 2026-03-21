import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLayout from '../pages/admin/index';
import AdminGuard from '../components/AdminGuard';

const AdminDashboard = lazy(() => import('../pages/admin/dashboard/index'));
const AdminChairs = lazy(() => import('../pages/admin/chairs/index'));
const AdminTables = lazy(() => import('../pages/admin/tables/index'));
const AdminOrders = lazy(() => import('../pages/admin/orders/index'));
const AdminTransactions = lazy(() => import('../pages/admin/transactions/index'));
const AdminSettings = lazy(() => import('../pages/admin/settings/index'));

export const adminRoutes = [
    {
        path: '/admin',
        element: <AdminGuard><AdminLayout /></AdminGuard>,
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
            {
                path: 'orders',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminOrders />
                    </Suspense>
                ),
            },
            {
                path: 'transactions',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminTransactions />
                    </Suspense>
                ),
            },
            {
                path: 'settings',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminSettings />
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
