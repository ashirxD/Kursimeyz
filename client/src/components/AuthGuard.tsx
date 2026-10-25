import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/stores";

const AuthGuard = () => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    // Remember where they were headed, so signing in puts them back there
    // instead of dropping them on the home page.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthGuard;
