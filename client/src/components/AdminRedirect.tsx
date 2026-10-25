import { Navigate, Outlet } from "react-router-dom";
import { useIsAdmin } from "@/stores";

/**
 * Wraps every storefront and sign-in route. The browser keeps an admin signed in
 * after the window is closed (the session is saved in localStorage for 7 days),
 * so opening the website again would show the shop as if the admin were a
 * customer: cart, "My Orders" and all. Anyone holding an admin session is sent
 * to the admin side instead.
 *
 * Signing out clears the session first, so the admin sign-in page and the
 * storefront stay reachable once they have signed out.
 */
const AdminRedirect = () => {
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRedirect;
