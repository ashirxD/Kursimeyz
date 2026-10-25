import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CategoryTabs from "@/components/CategoryTabs";
import CollectionCover from "@/components/CollectionCover";
import { hasUsableCategories, useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatPrice } from "@/utils/formatPrice";
import { useProducts } from "@/hooks/useProducts";
import { useProductTypeBySlug } from "@/hooks/useProductTypes";
import { aspectCss } from "@/utils/productImageDisplay";
import { getBannerCovers } from "@/utils/collectionCovers";
import { getEffectivePrice } from "@/utils/productPricing";
import ShopProductCard from "./card";

const ITEMS_PER_PAGE = 6;

type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

/**
 * One shop page for every kind of product, resolved from the URL segment. The
 * chairs, tables and sofas pages were three copies of this that differed only
 * in hero copy, price ceiling and cross-links — all of which now come from the
 * product type's record.
 */
function ShopContent({ typeSlug }: { typeSlug?: string }) {
  const { productType, productTypes, isLoading: isLoadingType } =
    useProductTypeBySlug(typeSlug);

  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>();
  // Short enough that dragging the slider feels live, long enough not to fire a
  // request for every pixel of the drag.
  const debouncedMaxPrice = useDebouncedValue(selectedMaxPrice, 350);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  // The filters take a whole screen of a phone, so they start folded away there.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Kept in the URL so a filtered view can be linked and the back button works.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  const { categories } = useCategories(productType?.slug);
  const { products, isLoading } = useProducts({
    category: productType?.slug,
    subCategory: activeCategory ?? undefined,
    maxPrice: debouncedMaxPrice,
  });

  useDocumentTitle(productType?.pluralName);

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
  }, [debouncedMaxPrice, activeCategory, typeSlug, searchTerm, sort]);

  const handleCategoryChange = (slug: string | null) => {
    setSearchParams(slug ? { category: slug } : {}, { replace: true });
  };

  // Price and category are filtered by the server; search and order are cheap
  // enough to do here, and feel instant that way.
  const shownProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matching = query
      ? products.filter((product) =>
          [product.name, product.description, product.subCategory]
            .filter(Boolean)
            .some((text) => String(text).toLowerCase().includes(query)),
        )
      : products;

    const ordered = [...matching];
    if (sort === "price-asc") {
      ordered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sort === "price-desc") {
      ordered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sort === "rating") {
      ordered.sort(
        (a, b) =>
          (b.averageRating ?? 0) - (a.averageRating ?? 0) ||
          (b.ratingCount ?? 0) - (a.ratingCount ?? 0),
      );
    }
    return ordered;
  }, [products, searchTerm, sort]);

  const hasActiveFilters =
    selectedMaxPrice !== undefined || Boolean(activeCategory) || searchTerm.trim() !== "";

  const clearAllFilters = () => {
    setSelectedMaxPrice(undefined);
    setSearchTerm("");
    setSearchParams({}, { replace: true });
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
  const visibleProducts = shownProducts.slice(0, visibleCount);
  const hasMore = visibleCount < shownProducts.length;
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
      <div className="mb-10">
        <h1 className="text-[32px] lg:text-[40px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-3">
          {productType.heroTitle ||
            `Find your perfect ${productType.name.toLowerCase()}`}
        </h1>
        {productType.heroSubtitle && (
          <p className="text-[15px] text-[#1a2f1a]/40 font-medium max-w-[480px] leading-relaxed">
            {productType.heroSubtitle}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* ─── Left Sidebar ─── */}
        <aside
          id="shop-filters"
          className={`w-full lg:w-[220px] flex-shrink-0 space-y-8 lg:block ${
            filtersOpen ? "block" : "hidden"
          }`}
        >
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
              aria-label="Maximum price"
              min={0}
              step={50}
              max={priceCeiling}
              value={Math.min(sliderValue, priceCeiling)}
              onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
              className="w-full accent-[#ff311b] cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[12px] font-bold text-[#1a2f1a]/50">
              <span>{formatPrice(0)}</span>
              <span>
                {selectedMaxPrice === undefined
                  ? "Any price"
                  : `Up to ${formatPrice(Math.min(selectedMaxPrice, priceCeiling))}`}
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

          {/* Categories read as the second filter, so they live with the
              first one rather than floating above the grid. */}
          {hasUsableCategories(categories) && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1a2f1a]">Category</h3>
                <span className="material-symbols-outlined text-[16px] text-[#1a2f1a]/30">
                  category
                </span>
              </div>
              <CategoryTabs
                categories={categories}
                value={activeCategory}
                onChange={handleCategoryChange}
                orientation="vertical"
              />
            </div>
          )}
        </aside>

        {/* ─── Product Grid ─── */}
        <div className="flex-1 min-w-0">
          {/* Find and order what's here */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#1a2f1a]/30 pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${productType.pluralName.toLowerCase()}`}
                aria-label={`Search ${productType.pluralName.toLowerCase()}`}
                enterKeyHint="search"
                className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-100 bg-white focus:border-[#ff311b] outline-none text-[14px] font-bold text-[#1a2f1a] placeholder:text-[#1a2f1a]/30 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="shop-filters"
                className="lg:hidden h-12 px-5 rounded-full border border-slate-100 bg-white text-[13px] font-bold text-[#1a2f1a] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Filters
                {(selectedMaxPrice !== undefined || activeCategory) && (
                  <span className="size-2 rounded-full bg-[#ff311b]" aria-label="Filters applied" />
                )}
              </button>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Sort products"
                className="flex-1 sm:flex-none h-12 pl-4 pr-8 rounded-full border border-slate-100 bg-white text-[13px] font-bold text-[#1a2f1a] cursor-pointer outline-none focus:border-[#ff311b]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isLoading && products.length > 0 && (
            <p role="status" className="text-[13px] font-bold text-[#1a2f1a]/40 mb-6">
              {shownProducts.length === products.length
                ? `${shownProducts.length} ${shownProducts.length === 1 ? productType.name.toLowerCase() : productType.pluralName.toLowerCase()}`
                : `${shownProducts.length} of ${products.length} ${productType.pluralName.toLowerCase()}`}
            </p>
          )}

          {isLoading ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div
                    style={{ aspectRatio: aspectCss(productType.cardAspect) }}
                    className="bg-[#f4f5f0] rounded-[20px]"
                  ></div>
                  <div className="pt-4 space-y-2.5">
                    <div className="h-4 bg-[#f4f5f0] rounded-full w-3/4"></div>
                    <div className="h-3 bg-[#f4f5f0] rounded-full w-1/2"></div>
                    <div className="h-5 bg-[#f4f5f0] rounded-full w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : shownProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
                {productType.icon}
              </span>
              <p className="text-[#1a2f1a]/40 font-bold text-lg mb-2">
                No {productType.pluralName.toLowerCase()} found
              </p>
              <p className="text-[#1a2f1a]/40 text-sm font-medium mb-6">
                {hasActiveFilters
                  ? "Nothing matches your search and filters."
                  : "Check back soon, new pieces are added regularly."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-[#1a2f1a] text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {visibleProducts.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    aspect={productType.cardAspect}
                    placeholderIcon={productType.icon}
                  />
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
                  images={getBannerCovers(type).images}
                  display={getBannerCovers(type).display}
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

export default function ShopPage() {
  const { typeSlug } = useParams<{ typeSlug: string }>();
  return <ShopContent key={typeSlug} typeSlug={typeSlug} />;
}
