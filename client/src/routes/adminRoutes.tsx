import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminLayout from '../pages/admin/index';
import AdminGuard from '../components/AdminGuard';

const AdminDashboard = lazy(() => import('../pages/admin/dashboard/index'));
const AdminProducts = lazy(() => import('../pages/admin/products/index'));
const AdminOrders = lazy(() => import('../pages/admin/orders/index'));
const AdminOrderDetail = lazy(() => import('../pages/admin/orders/detail'));
const AdminTransactions = lazy(() => import('../pages/admin/transactions/index'));
const AdminCustomers = lazy(() => import('../pages/admin/customers/index'));
const AdminSettings = lazy(() => import('../pages/admin/settings/index'));
const AdminAbout = lazy(() => import('../pages/admin/about/index'));
const AdminHome = lazy(() => import('../pages/admin/home/index'));
const AdminProfile = lazy(() => import('../pages/admin/profile'));
const AdminSellerManagement = lazy(() => import('../pages/admin/SellerManagment/index'));
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
                // One page for every kind of product; the segment selects it.
                path: 'products/:typeSlug',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminProducts />
                    </Suspense>
                ),
            },
            // The built-in kinds used to have a route each — keep old bookmarks working.
            { path: 'chairs', element: <Navigate to="/admin/products/chairs" replace /> },
            { path: 'tables', element: <Navigate to="/admin/products/tables" replace /> },
            { path: 'sofas', element: <Navigate to="/admin/products/sofas" replace /> },
            {
                path: 'orders',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminOrders />
                    </Suspense>
                ),
            },
            {
                path: 'orders/:orderId',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminOrderDetail />
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
                path: 'customers',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminCustomers />
                    </Suspense>
                ),
            },
            {
                path: 'seller-management',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminSellerManagement />
                    </Suspense>
                ),
            },
            {
                path: 'home',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminHome />
                    </Suspense>
                ),
            },
            {
                path: 'about',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminAbout />
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
            {
                path: 'profile',
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <AdminProfile />
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
