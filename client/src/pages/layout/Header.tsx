import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useIsAuthenticated, useAuthStore } from "@/stores/authStore";
import api from "@/utils/Axios";
import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Which product type's sub-categories the flyout is showing, and where it
  // sits so it lines up with that type's row.
  const [hoveredTypeSlug, setHoveredTypeSlug] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileTypeSlug, setMobileTypeSlug] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { productTypes } = useProductTypes();
  // Unscoped: one request covers every type's sub-categories.
  const { categories } = useCategories();
  const isAuthenticated = useIsAuthenticated();

  // Built from whatever kinds the admin has created, so a new one shows up here
  // without a code change. Sub-categories with no products are dropped, the same
  // way the shop page's tabs drop them.
  const shopCategories = useMemo(() => {
    const byType = new Map<string, typeof categories>();
    categories
      .filter((category) => category.productCount > 0)
      .forEach((category) => {
        const list = byType.get(category.productType) ?? [];
        list.push(category);
        byType.set(category.productType, list);
      });

    return productTypes.map((type) => ({
      slug: type.slug,
      label: type.pluralName,
      icon: type.icon,
      route: `/shop/${type.pluralSlug}`,
      subCategories: (byType.get(type.slug) ?? []).map((category) => ({
        id: category._id,
        name: category.name,
        route: `/shop/${type.pluralSlug}?category=${category.slug}`,
      })),
    }));
  }, [productTypes, categories]);

  // Only set once a type is hovered — the sub-category panel stays hidden until then.
  const activeType = shopCategories.find((type) => type.slug === hoveredTypeSlug);

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const isActivePath = (path: string) => location.pathname === path;
  const isShopActive = location.pathname.startsWith("/shop");

  const closeDropdown = () => {
    setDropdownOpen(false);
    setHoveredTypeSlug(null);
  };

  /**
   * Opens the sub-category flyout level with the row, so the pointer only has
   * to travel sideways to reach it. Offsets by the panel's own padding so the
   * first sub-category lines up with the row, and by the list's scroll position
   * because offsetTop ignores it.
   */
  const openTypeFlyout = (slug: string, row: HTMLAnchorElement) => {
    setHoveredTypeSlug(slug);
    setFlyoutTop(row.offsetTop - (row.parentElement?.scrollTop ?? 0) - 8);
  };

  const closeMobileShop = () => {
    setMobileShopOpen(false);
    setMobileTypeSlug(null);
  };

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

  const mobileTabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-14 transition-colors ${
      active ? "text-[#1a2f1a]" : "text-[#1a2f1a]/50"
    }`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center group">
          <BrandLogo
            imageClassName="h-10 lg:h-12 w-auto max-w-[150px] sm:max-w-[190px] transition-transform group-hover:scale-[1.03]"
          />
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Home */}
          <Link
            to="/dashboard"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
          </Link>

          {/* Top Picks */}
          {/* <Link
            to="/top-picks"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Top Picks
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
          </Link> */}

          {/* Shop with dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={closeDropdown}
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
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
            </button>

            {/* Dropdown: the product types. Hovering one that has
                sub-categories opens a second panel beside it. */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ${
                dropdownOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              }`}
            >
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-slate-100 p-2 w-[260px] max-h-[70vh] overflow-y-auto">
                  {shopCategories.map((cat) => {
                    const isActive = activeType?.slug === cat.slug;
                    return (
                      <Link
                        key={cat.slug}
                        to={cat.route}
                        onClick={closeDropdown}
                        onMouseEnter={(event) =>
                          openTypeFlyout(cat.slug, event.currentTarget)
                        }
                        onFocus={(event) =>
                          openTypeFlyout(cat.slug, event.currentTarget)
                        }
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group/item ${
                          isActive
                            ? "bg-[#f4f5f0] text-[#1a2f1a]"
                            : "text-[#1a2f1a]/70 hover:bg-[#f4f5f0] hover:text-[#1a2f1a]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#ff311b] group-hover/item:scale-110 transition-transform">
                          {cat.icon}
                        </span>
                        <span className="text-[13px] font-bold truncate">
                          {cat.label}
                        </span>
                        <span className="material-symbols-outlined text-[16px] ml-auto opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">
                          {cat.subCategories.length > 0
                            ? "chevron_right"
                            : "arrow_forward"}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Sub-categories, only while a type with any is hovered.
                    The padding is the bridge the pointer crosses, so the
                    dropdown keeps hover the whole way. */}
                {activeType && activeType.subCategories.length > 0 && (
                  <div
                    className="absolute left-full pl-2"
                    style={{ top: flyoutTop }}
                  >
                    <div className="bg-white rounded-2xl shadow-xl shadow-black/8 border border-slate-100 p-2 w-[220px] max-h-[70vh] overflow-y-auto">
                      {activeType.subCategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.route}
                          onClick={closeDropdown}
                          className="block px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#1a2f1a]/70 hover:bg-[#f4f5f0] hover:text-[#1a2f1a] transition-all truncate"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <Link
            to="/about"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
          </Link>

          {/* Contact */}
          {/* <Link
            to="/contact"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
          </Link> */}

          {/* My Orders */}
          <Link
            to="/orders"
            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
          >
            My Orders
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff311b] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                onClick={() => console.log("Navigating to /cart")}
                className="h-11 px-4 sm:px-6 bg-[#1a2f1a] hover:bg-black text-white rounded-full flex items-center gap-2 sm:gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10"
              >
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
                <span className="hidden sm:inline text-[13px] font-black uppercase tracking-widest">
                  Cart ({totalItems})
                </span>
                <span className="sm:hidden text-[12px] font-black">
                  {totalItems}
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
              className="h-11 px-4 sm:px-6 bg-[#ff311b] hover:bg-[#e52c18] text-white rounded-full flex items-center gap-2 sm:gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#ff311b]/30 font-bold text-[12px] sm:text-[13px] uppercase tracking-widest"
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

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-100 bg-white/95 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">
        {mobileShopOpen && (
          <div className="absolute bottom-16 left-0 right-0 border-t border-slate-100 bg-white px-4 py-3 shadow-lg shadow-black/5">
            {/* Same two levels as desktop, as an accordion: the row opens the
                whole collection, the chevron reveals sub-categories. */}
            <div className="max-h-[50vh] overflow-y-auto space-y-1.5">
              {shopCategories.map((cat) => {
                const isOpen = mobileTypeSlug === cat.slug;
                return (
                  <div
                    key={cat.slug}
                    className="rounded-2xl bg-[#f7f8f3] overflow-hidden"
                  >
                    <div className="flex items-center">
                      <Link
                        to={cat.route}
                        onClick={closeMobileShop}
                        className="flex flex-1 min-w-0 items-center gap-3 px-3 py-3 text-[#1a2f1a]"
                      >
                        <span className="material-symbols-outlined text-[22px] text-[#ff311b]">
                          {cat.icon}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wide truncate">
                          {cat.label}
                        </span>
                      </Link>
                      {cat.subCategories.length > 0 && (
                        <button
                          type="button"
                          aria-label={`Toggle ${cat.label} sub-categories`}
                          aria-expanded={isOpen}
                          onClick={() =>
                            setMobileTypeSlug(isOpen ? null : cat.slug)
                          }
                          className="px-3 py-3 text-[#1a2f1a]/50"
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            {isOpen ? "expand_less" : "expand_more"}
                          </span>
                        </button>
                      )}
                    </div>

                    {isOpen && cat.subCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                        {cat.subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={sub.route}
                            onClick={closeMobileShop}
                            className="px-3 py-1.5 rounded-full bg-white border border-[#1a2f1a]/10 text-[11px] font-bold text-[#1a2f1a]/70"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <nav className="grid grid-cols-4 h-16 px-2">
          <Link
            to="/dashboard"
            className={mobileTabClass(isActivePath("/dashboard") || isActivePath("/"))}
            onClick={closeMobileShop}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[10px] font-black uppercase tracking-wide">
              Home
            </span>
          </Link>

          <button
            type="button"
            className={mobileTabClass(isShopActive)}
            onClick={() =>
              setMobileShopOpen((open) => {
                if (open) setMobileTypeSlug(null);
                return !open;
              })
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              storefront
            </span>
            <span className="text-[10px] font-black uppercase tracking-wide">
              Shop
            </span>
          </button>

          <Link
            to="/about"
            className={mobileTabClass(isActivePath("/about"))}
            onClick={closeMobileShop}
          >
            <span className="material-symbols-outlined text-[22px]">info</span>
            <span className="text-[10px] font-black uppercase tracking-wide">
              About
            </span>
          </Link>

          <Link
            to="/orders"
            className={mobileTabClass(isActivePath("/orders"))}
            onClick={closeMobileShop}
          >
            <span className="material-symbols-outlined text-[22px]">
              receipt_long
            </span>
            <span className="text-[10px] font-black uppercase tracking-wide">
              My Orders
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
}
