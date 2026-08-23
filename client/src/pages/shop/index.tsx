import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CategoryTabs from "@/components/CategoryTabs";
import CollectionCover from "@/components/CollectionCover";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProducts } from "@/hooks/useProducts";
import { useProductTypeBySlug } from "@/hooks/useProductTypes";
import { getEffectivePrice } from "@/utils/productPricing";
import ShopProductCard from "./card";

const ITEMS_PER_PAGE = 6;

/**
 * One shop page for every kind of product, resolved from the URL segment. The
 * chairs, tables and sofas pages were three copies of this that differed only
 * in hero copy, price ceiling and cross-links — all of which now come from the
 * product type's record.
 */
export default function ShopPage() {
  const { typeSlug } = useParams<{ typeSlug: string }>();
  const { productType, productTypes, isLoading: isLoadingType } =
    useProductTypeBySlug(typeSlug);

  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>();
  const debouncedMaxPrice = useDebouncedValue(selectedMaxPrice, 1000);
  // Kept in the URL so a filtered view can be linked and the back button works.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  const { categories } = useCategories(productType?.slug);
  const { products, isLoading } = useProducts({
    category: productType?.slug,
    subCategory: activeCategory ?? undefined,
    maxPrice: debouncedMaxPrice,
  });

  const defaultMaxPrice = productType?.defaultMaxPrice ?? 1500;
  const [priceCeiling, setPriceCeiling] = useState(defaultMaxPrice);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [typeSlug]);

  useEffect(() => {
    const highestPrice = Math.max(
      defaultMaxPrice,
      ...products.map((product) => getEffectivePrice(product)),
    );
    setPriceCeiling((currentCeiling) => Math.max(currentCeiling, highestPrice));
  }, [products, defaultMaxPrice]);

  // A different kind of product needs its own ceiling, not the last one's.
  useEffect(() => {
    setPriceCeiling(defaultMaxPrice);
    setSelectedMaxPrice(undefined);
  }, [typeSlug, defaultMaxPrice]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [debouncedMaxPrice, activeCategory, typeSlug]);

  const handleCategoryChange = (slug: string | null) => {
    setSearchParams(slug ? { category: slug } : {}, { replace: true });
  };

  if (isLoadingType) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold uppercase tracking-widest text-[10px]">
          Loading collection...
        </div>
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
          search_off
        </span>
        <h2 className="text-2xl font-bold text-[#1a2f1a] mb-2">
          Collection Not Found
        </h2>
        <p className="text-[#1a2f1a]/40 mb-6 font-medium">
          We don't have a collection at this address.
        </p>
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const sliderValue = selectedMaxPrice ?? priceCeiling;
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const otherTypes = productTypes.filter((type) => type.slug !== productType.slug);

  return (
    <div className="pt-20 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[#1a2f1a]/40 font-medium mb-8">
        <Link to="/dashboard" className="hover:text-[#1a2f1a] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          to="/dashboard#find-your-space"
          className="hover:text-[#1a2f1a] transition-colors"
        >
          Shop
        </Link>
        <span>/</span>
        <span className="text-[#1a2f1a]">{productType.pluralName}</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-4">
          {productType.heroTitle ||
            `Find your perfect ${productType.name.toLowerCase()}`}
        </h1>
        {productType.heroSubtitle && (
          <p className="text-base text-[#1a2f1a]/40 font-medium max-w-[520px] leading-relaxed">
            {productType.heroSubtitle}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* ─── Left Sidebar ─── */}
        <aside className="w-full lg:w-[220px] flex-shrink-0 space-y-8">
          {/* Price Range */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1a2f1a]">Price Range</h3>
              <span className="material-symbols-outlined text-[16px] text-[#1a2f1a]/30">
                tune
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              value={Math.min(sliderValue, priceCeiling)}
              onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
              className="w-full accent-[#ff311b] cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[12px] font-bold text-[#1a2f1a]/50">
              <span>Rs. 0</span>
              <span>
                {selectedMaxPrice === undefined
                  ? "Any price"
                  : `Up to Rs. ${Math.min(selectedMaxPrice, priceCeiling)}`}
              </span>
            </div>
            {selectedMaxPrice !== undefined && (
              <button
                type="button"
                onClick={() => setSelectedMaxPrice(undefined)}
                className="mt-4 text-[12px] font-bold text-[#1a2f1a]/50 hover:text-[#1a2f1a] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </aside>

        {/* ─── Product Grid ─── */}
        <div className="flex-1 min-w-0">
          <CategoryTabs
            categories={categories}
            value={activeCategory}
            onChange={handleCategoryChange}
          />

          {isLoading ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-100 rounded-2xl aspect-square mb-4"></div>
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
                {productType.icon}
              </span>
              <p className="text-[#1a2f1a]/40 font-bold text-lg mb-2">
                No {productType.pluralName.toLowerCase()} found
              </p>
              <p className="text-[#1a2f1a]/30 text-sm font-medium">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3 border-2 border-[#1a2f1a]/10 text-[#1a2f1a] rounded-full text-[13px] font-bold hover:border-[#1a2f1a] hover:bg-[#1a2f1a] hover:text-white transition-all cursor-pointer"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Explore Other Collections */}
      {otherTypes.length > 0 && (
        <section className="mt-24 pt-16 border-t border-slate-100">
          <h2 className="text-[24px] font-black text-[#1a2f1a] mb-10 text-center uppercase tracking-widest">
            Explore Other Collections
          </h2>
          <div
            className={`grid grid-cols-1 gap-8 max-w-[900px] mx-auto ${
              otherTypes.length > 1 ? "md:grid-cols-2" : ""
            }`}
          >
            {otherTypes.map((type) => (
              <Link
                key={type._id}
                to={`/shop/${type.pluralSlug}`}
                className="group relative h-[250px] rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[#1a2f1a]"
              >
                <CollectionCover
                  images={type.coverImages}
                  icon={type.icon}
                  alt={type.pluralName}
                  layerClassName="duration-700 group-hover:scale-110"
                  iconClassName="text-[80px]"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center">
                  <h3 className="text-white text-2xl font-black uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-lg">
                    {type.pluralName}
                  </h3>
                  <div className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[12px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View Collection
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
