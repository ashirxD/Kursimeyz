import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import TableProductCard from "./cards";

const MATERIALS = ["Solid Oak", "Walnut Finish", "Glass Top", "Metal Frame"];
const COLOR_SWATCHES = [
  { name: "Natural", value: "#D2B48C" },
  { name: "Dark Oak", value: "#4B3621" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
];

const ITEMS_PER_PAGE = 6;

export default function TablesPage() {
  const { products: tables, isLoading } = useProducts({ category: "table" });

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
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
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (table.price < priceRange[0] || table.price > priceRange[1])
        return false;
      if (selectedMaterials.length > 0) {
        const desc = (table.description || "").toLowerCase();
        const matchesMaterial = selectedMaterials.some((m) =>
          desc.includes(m.toLowerCase()),
        );
        if (!matchesMaterial) return false;
      }
      if (selectedColor) {
        const tableColor = (table.color || "").toLowerCase();
        if (!tableColor.includes(selectedColor.toLowerCase())) return false;
      }
      return true;
    });
  }, [tables, priceRange, selectedMaterials, selectedColor]);

  const visibleTables = filteredTables.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTables.length;

  const getBadge = (index: number): "NEW" | "SALE" | undefined => {
    if (index === 0) return "NEW";
    if (index === 3) return "SALE";
    return undefined;
  };

  return (
    <div className="pt-20 pb-16">
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
        <span className="text-[#1a2f1a]">Tables</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-4">
          Find your perfect table
        </h1>
        <p className="text-base text-[#1a2f1a]/40 font-medium max-w-[520px] leading-relaxed">
          Elegant and sturdy tables for your dining room, office, or living
          space. Crafted with care from premium materials.
        </p>
      </div>

      <div className="flex gap-10">
        <aside className="hidden lg:block w-[220px] flex-shrink-0 space-y-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1a2f1a]">Price Range</h3>
            </div>
            <input
              type="range"
              min={0}
              max={2000}
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

        <div className="flex-1 min-w-0">
          {isLoading ? (
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
          ) : filteredTables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[64px] text-[#1a2f1a]/10 mb-4">
                table_restaurant
              </span>
              <p className="text-[#1a2f1a]/40 font-bold text-lg mb-2">
                No tables found
              </p>
              <p className="text-[#1a2f1a]/30 text-sm font-medium">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTables.map((table, index) => (
                  <TableProductCard
                    key={table.id}
                    table={table}
                    badge={getBadge(index)}
                  />
                ))}
              </div>

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
