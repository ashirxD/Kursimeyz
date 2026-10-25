import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin, useIsAuthenticated } from "@/stores";

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  // Nobody signed in: the admin sign-in page, not the shop.
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // A customer who wandered into /admin goes back to the shop.
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
