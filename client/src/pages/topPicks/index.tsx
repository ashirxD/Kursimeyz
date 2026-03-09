import { useProduct, type Product } from "@/hooks/useProduct";
import { Link } from "react-router-dom";
import { useRef } from "react";

export default function TopPicks() {
  const { groupedProducts, isGroupedLoading } = useProduct();

  const categories = [
    { id: "chair", label: "Premium Chairs", icon: "chair" },
    { id: "table", label: "Modern Tables", icon: "table_restaurant" },
    { id: "sofa", label: "Comfortable Sofas", icon: "weekend" },
  ];

  if (isGroupedLoading) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold uppercase tracking-widest">
          Curating your top picks...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto overflow-hidden">
      <div className="space-y-10">
        {categories.map((cat) => (
          <ProductRow
            key={cat.id}
            title={cat.label}
            products={groupedProducts[cat.id] || []}
            icon={cat.icon}
          />
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  title,
  products,
  icon,
}: {
  title: string;
  products: Product[];
  icon: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group/row">
      <div className="flex items-center justify-between mb-4 pr-4">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-[#f4f5f0] rounded-lg flex items-center justify-center text-[#5ef037]">
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
          <h2 className="text-sm font-black text-[#1a2f1a] uppercase tracking-wider">
            {title}
          </h2>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll("left")}
            className="size-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#1a2f1a] hover:bg-[#5ef037] hover:border-[#5ef037] hover:text-white transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="size-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-[#1a2f1a] hover:bg-[#5ef037] hover:border-[#5ef037] hover:text-white transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="w-[140px] md:w-[170px] flex-shrink-0 snap-start group"
          >
            <div className="bg-[#f4f5f0] rounded-[1.5rem] aspect-square p-4 mb-2 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:shadow-black/5">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors" />
            </div>
            <div className="px-1">
              <h3 className="font-bold text-[#1a2f1a] text-[11px] group-hover:text-[#5ef037] transition-colors truncate">
                {product.name}
              </h3>
              <p className="text-[#1a2f1a]/40 font-black text-[9px] mt-0.5 uppercase tracking-widest">
                Rs. {product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
