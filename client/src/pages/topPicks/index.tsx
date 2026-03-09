import { useProduct, type Product } from "@/hooks/useProduct";
import { Link } from "react-router-dom";

interface TopPicksProps {
  limit?: number;
  isDashboard?: boolean;
}

export default function TopPicks({
  limit,
  isDashboard = false,
}: TopPicksProps) {
  const { groupedProducts, isGroupedLoading } = useProduct();

  if (isGroupedLoading) {
    return (
      <div
        className={`${isDashboard ? "py-10" : "pt-32 pb-16"} flex items-center justify-center`}
      >
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold uppercase tracking-widest text-[10px]">
          Curating your top picks...
        </div>
      </div>
    );
  }

  // Flatten and shuffle products
  const allProducts = Object.values(groupedProducts).flat() as Product[];
  const randomizedProducts = [...allProducts].sort(() => 0.5 - Math.random());

  // Apply limit if provided
  const displayProducts = limit
    ? randomizedProducts.slice(0, limit)
    : randomizedProducts;

  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <div
      className={`${isDashboard ? "py-12" : "pt-24 pb-16"} px-4 md:px-8 max-w-[1600px] mx-auto overflow-hidden`}
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#1a2f1a]/5" />
        <h1 className="text-[10px] font-black text-[#1a2f1a]/30 uppercase tracking-[0.4em] whitespace-nowrap">
          Top Picks
        </h1>
        <div className="h-px flex-1 bg-[#1a2f1a]/5" />
      </div>

      <div
        className={`grid gap-x-8 gap-y-12 
        ${
          isDashboard
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        }`}
      >
        {displayProducts.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="group flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-1"
          >
            <div
              className={`aspect-[4/5] w-full flex items-center justify-center relative overflow-hidden 
              ${isDashboard ? "mb-4" : "mb-2"}`}
            >
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <div className="max-w-full px-2 space-y-1.5">
              <h3
                className={`font-bold text-[#1a2f1a] group-hover:text-[#5ef037] transition-colors truncate w-full
                ${isDashboard ? "text-[14px]" : "text-[11px]"}`}
              >
                {product.name}
              </h3>
              <p
                className={`text-[#1a2f1a]/40 font-black uppercase tracking-wider flex items-center justify-center gap-1
                ${isDashboard ? "text-[11px]" : "text-[9px]"}`}
              >
                <span className="text-[8px] opacity-70">PKR</span>
                <span>{product.price}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
