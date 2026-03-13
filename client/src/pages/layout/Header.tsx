import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useIsAuthenticated, useAuthStore } from "@/stores/authStore";
import api from "@/utils/Axios";

const shopCategories = [
  { label: "Chairs", icon: "chair", route: "/shop/chairs" },
  { label: "Tables", icon: "table_restaurant", route: "/shop/tables" },
  { label: "Sofas", icon: "weekend", route: "/shop/sofas" },
];

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { totalItems } = useCart();
  const isAuthenticated = useIsAuthenticated();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="size-7 bg-[#5ef037] rounded-lg flex items-center justify-center shadow-lg shadow-[#5ef037]/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white font-bold text-lg">
              chair
            </span>
          </div>
          <h1 className="text-base font-black text-[#1a2f1a] tracking-tight flex flex-col leading-none">
            <span>Relaxing</span>
            <span className="text-[#5ef037]">Chair Shop</span>
          </h1>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Home */}
          <Link
            to="/dashboard"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
          </Link>

          {/* Top Picks */}
          {/* <Link
            to="/top-picks"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Top Picks
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
          </Link> */}

          {/* Shop with dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group flex items-center gap-1 cursor-pointer">
              Shop
              <span
                className="material-symbols-outlined text-[16px] transition-transform duration-300"
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                expand_more
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
            </button>

            {/* Dropdown */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${
                dropdownOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              }`}
            >
              <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-slate-100 p-2 min-w-[200px]">
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.route}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1a2f1a]/70 hover:bg-[#f4f5f0] hover:text-[#1a2f1a] transition-all group/item"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#5ef037] group-hover/item:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <span className="text-[13px] font-bold">{cat.label}</span>
                    <span className="material-symbols-outlined text-[16px] ml-auto opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* About */}
          <Link
            to="/about"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
          </Link>

          {/* Contact */}
          {/* <Link
            to="/contact"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
          </Link> */}

          {/* My Orders */}
          <Link
            to="/orders"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            My Orders
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="size-11 flex items-center justify-center text-[#1a2f1a] hover:bg-slate-50 rounded-full transition-all">
            <span className="material-symbols-outlined text-[26px]">
              search
            </span>
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                onClick={() => console.log("Navigating to /cart")}
                className="h-11 px-6 bg-[#1a2f1a] hover:bg-black text-white rounded-full flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10"
              >
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
                <span className="text-[13px] font-black uppercase tracking-widest">
                  Cart ({totalItems})
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="size-11 flex items-center justify-center text-[#1a2f1a] hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[24px]">
                  logout
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="h-11 px-6 bg-[#5ef037] hover:bg-[#4ad12d] text-[#1a2f1a] rounded-full flex items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#5ef037]/30 font-black text-[13px] uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[20px]">
                login
              </span>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
