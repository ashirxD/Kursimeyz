import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load components
const Login = lazy(() => import('../pages/auth/login'));
const Signup = lazy(() => import('../pages/auth/signup'));
const AdminLogin = lazy(() => import('../pages/auth/adminLogin'));

export const publicRoutes = [
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: '/login',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: '/signup',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <Signup />
            </Suspense>
        ),
    },
    {
        path: '/admin-login',
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                <AdminLogin />
            </Suspense>
        ),
    },
];
