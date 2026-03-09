import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ChairProductCard from "./cards";

const MATERIALS = [
  "Solid Oak",
  "Walnut Finish",
  "Natural Rattan",
  "Recycled Plastic",
];
const COLOR_SWATCHES = [
  { name: "Brown", value: "#8B6914" },
  { name: "Beige", value: "#C8B896" },
  { name: "Dark Grey", value: "#4A4A4A" },
  { name: "Green", value: "#6B8E5A" },
  { name: "Dark Brown", value: "#5C4033" },
  { name: "Light Blue", value: "#B0D4DB" },
];

const ITEMS_PER_PAGE = 6;

export default function ChairsPage() {
  const { products: chairs, isLoading } = useProducts({ category: "chair" });

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Toggle material filter
  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
  };

  // Filtered products
  const filteredChairs = useMemo(() => {
    return chairs.filter((chair) => {
      // Price
      if (chair.price < priceRange[0] || chair.price > priceRange[1])
        return false;
      // Materials
      if (selectedMaterials.length > 0) {
        const desc = (chair.description || "").toLowerCase();
        const matchesMaterial = selectedMaterials.some((m) =>
          desc.includes(m.toLowerCase()),
        );
        if (!matchesMaterial) return false;
      }
      // Color
      if (selectedColor) {
        const chairColor = (chair.color || "").toLowerCase();
        if (!chairColor.includes(selectedColor.toLowerCase())) return false;
      }
      return true;
    });
  }, [chairs, priceRange, selectedMaterials, selectedColor]);

  const visibleChairs = filteredChairs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChairs.length;

  // Assign badges to first few products for visual variety
  const getBadge = (index: number): "NEW" | "SALE" | undefined => {
    if (index === 1) return "NEW";
    if (index === 4) return "SALE";
    return undefined;
  };

  return (
    <div className="pt-20 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[#1a2f1a]/40 font-medium mb-8">
        <Link
          to="/dashboard"
          className="hover:text-[#1a2f1a] transition-colors"
        >
          Home
        </Link>
        <span>/</span>
        <span className="text-[#1a2f1a]/40">Shop</span>
        <span>/</span>
        <span className="text-[#1a2f1a]">Chairs</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-4">
          Find your perfect seat
        </h1>
        <p className="text-base text-[#1a2f1a]/40 font-medium max-w-[520px] leading-relaxed">
          Handcrafted from sustainable materials for your sanctuary. Designed to
          bring peace and comfort to your living space.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-10">
        {/* ─── Left Sidebar ─── */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0 space-y-8">
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
              max={1500}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-[#5ef037] cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[12px] font-bold text-[#1a2f1a]/50">
              <span>Rs. {priceRange[0]}</span>
              <span>Rs. {priceRange[1]}+</span>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-[#1a2f1a] mb-4">Materials</h3>
            <div className="space-y-3">
              {MATERIALS.map((material) => (
                <label
                  key={material}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMaterials.includes(material)
                        ? "border-[#5ef037] bg-[#5ef037]"
                        : "border-slate-200 group-hover:border-[#5ef037]/50"
                    }`}
                    onClick={() => toggleMaterial(material)}
                  >
                    {selectedMaterials.includes(material) && (
                      <span className="material-symbols-outlined text-white text-[14px] font-bold">
                        check
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-medium text-[#1a2f1a]/70">
                    {material}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-[#1a2f1a] mb-4">Colors</h3>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.name}
                  onClick={() =>
                    setSelectedColor(
                      selectedColor === swatch.name ? null : swatch.name,
                    )
                  }
                  className={`size-8 rounded-full transition-all cursor-pointer ${
                    selectedColor === swatch.name
                      ? "ring-2 ring-[#5ef037] ring-offset-2 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: swatch.value }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Product Grid ─── */}
        <div className="flex-1 min-w-0">
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
          ) : filteredChairs.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
                chair
              </span>
              <p className="text-[#1a2f1a]/40 font-bold text-lg mb-2">
                No chairs found
              </p>
              <p className="text-[#1a2f1a]/30 text-sm font-medium">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleChairs.map((chair, index) => (
                  <ChairProductCard
                    key={chair.id}
                    chair={chair}
                    badge={getBadge(index)}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                    }
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
    </div>
  );
}
