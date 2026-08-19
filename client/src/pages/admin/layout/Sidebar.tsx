import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useSidebarStore, useUser } from "@/stores";
import BrandLogo from "@/components/BrandLogo";
import ProductTypeFormModal from "@/components/ProductTypeFormModal";
import { useProductTypes } from "@/hooks/useProductTypes";
import api from "@/utils/Axios";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar } = useSidebarStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useUser();
  const { productTypes } = useProductTypes();
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      logout();
      closeSidebar();
      navigate("/admin-login", { replace: true });
    }
  };

  // Product tabs are data now — whatever kinds the admin has created, in order.
  const productNavItems = productTypes.map((type) => ({
    name: type.pluralName,
    icon: type.icon,
    path: `/admin/products/${type.pluralSlug}`,
  }));

  const topNavItems = [
    {
      name: "Dashboard",
      icon: "dashboard",
      path: "/admin/dashboard",
    },
  ];

  const bottomNavItems = [
    {
      name: "Orders",
      icon: "shopping_basket",
      path: "/admin/orders",
    },
    // {
    //   name: "Transactions",
    //   icon: "payments",
    //   path: "/admin/transactions",
    // },
    {
      name: "Customers",
      icon: "group",
      path: "/admin/customers",
    },
    {
      name: "Seller Management",
      icon: "store",
      path: "/admin/seller-management",
    },
    {
      name: "Home Hero",
      icon: "web",
      path: "/admin/home",
    },
    {
      name: "About Page",
      icon: "article",
      path: "/admin/about",
    },
    {
      name: "Settings",
      icon: "settings",
      path: "/admin/settings",
    },
  ];

  const renderNavItem = (item: { name: string; icon: string; path: string }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path === "/admin/dashboard" && location.pathname === "/admin");

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={closeSidebar}
        className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all group shrink-0 ${
          isActive
            ? "bg-oatmeal text-forest-moss font-bold shadow-soft"
            : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
        }`}
      >
        <span
          className={`material-symbols-outlined !text-xl ${isActive ? "" : "text-white/50 group-hover:text-white"}`}
        >
          {item.icon}
        </span>
        <span className="text-[13px] tracking-wide truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            fixed lg:sticky top-0 lg:top-4 left-0 z-50
            w-72 lg:w-64 bg-forest-moss text-white
            flex flex-col justify-between p-6
            h-full lg:h-[calc(100vh-2rem)]
            lg:rounded-3xl lg:ml-4 lg:mb-4
            overflow-hidden shrink-0 transition-transform duration-300 ease-in-out
        `}
    >
      <div className="flex flex-col gap-6 min-h-0 flex-1">
        {/* Logo / Brand & Close Button */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="shrink-0" imageClassName="h-8 w-auto max-w-[150px]" />
          </div>

          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden size-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation — scrolls once enough product kinds are added. */}
        <nav className="flex flex-col gap-1.5 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topNavItems.map(renderNavItem)}

          {productNavItems.map(renderNavItem)}

          <button
            type="button"
            onClick={() => setIsAddTypeOpen(true)}
            title="Add a new kind of product"
            className="flex items-center gap-3.5 px-4 py-3 rounded-full border-2 border-dashed border-white/15 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all font-medium"
          >
            <span className="material-symbols-outlined !text-xl">add</span>
            <span className="text-[13px] tracking-wide">Add Product Kind</span>
          </button>

          <div className="h-px bg-white/10 my-2 mx-4" />

          {bottomNavItems.map(renderNavItem)}
        </nav>
      </div>

      <ProductTypeFormModal
        isOpen={isAddTypeOpen}
        onClose={() => setIsAddTypeOpen(false)}
        onCreated={(productType) => {
          closeSidebar();
          navigate(`/admin/products/${productType.pluralSlug}`);
        }}
      />

      {/* Bottom section */}
      <div className="mt-auto shrink-0 space-y-6">
        <div className="flex items-center justify-between px-1 pb-1">
          <Link
            to="/admin/profile"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity overflow-hidden"
          >
            {/* Avatar */}
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.username || 'Profile'}
                className="size-9 rounded-full border-2 border-white/20 object-cover shadow-soft shrink-0"
              />
            ) : (
              <div className="size-9 rounded-full border-2 border-white/20 bg-cover bg-center shadow-soft shrink-0 flex items-center justify-center bg-white/10 text-white">
                <span className="material-symbols-outlined !text-lg">
                  person
                </span>
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate leading-tight">
                {user?.username || "Maker Sophie"}
              </p>
              <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                {user?.role || "Shop Owner"}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="size-9 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-all group shadow-sm border border-white/5"
            title="Logout"
          >
            <span className="material-symbols-outlined !text-xl group-hover:rotate-12 transition-transform">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
