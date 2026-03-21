import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/stores";

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
