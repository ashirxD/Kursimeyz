import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "@/stores";

const AuthGuard = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
