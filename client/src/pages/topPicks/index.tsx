import { useState } from "react";
import { useProduct, type Product } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
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
  const { addToCart, isAdding } = useCart();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

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
        {displayProducts.map((product) => {
          const isAdded = addedProductId === product._id;
          const isCurrentAdding = isAdding && addedProductId === product._id;

          const handleAddToCart = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setAddedProductId(product._id);
            addToCart(
              { productId: product._id },
              {
                onSuccess: () => {
                  setTimeout(() => setAddedProductId(null), 2000);
                },
                onError: () => {
                  setAddedProductId(null);
                },
              }
            );
          };

          return (
            <div
              key={product._id}
              className="group flex flex-col h-full"
            >
              {/* Image Container - Fixed height with object-cover */}
              <Link
                to={`/product/${product._id}`}
                className="block w-full aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3"
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Content - Fixed structure */}
              <div className="flex flex-col flex-1">
                {/* Name and Price in one row */}
                <Link to={`/product/${product._id}`} className="mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold text-[#1a2f1a] group-hover:text-[#5ef037] transition-colors truncate
                      ${isDashboard ? "text-[15px]" : "text-[14px]"}`}
                    >
                      {product.name}
                    </h3>
                    <span
                      className={`font-black text-[#d27d53] whitespace-nowrap
                      ${isDashboard ? "text-[15px]" : "text-[14px]"}`}
                    >
                      {product.price} Rs
                    </span>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isCurrentAdding || isAdded}
                  className={`w-full py-2 px-3 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 mt-auto
                    ${isAdded 
                      ? "bg-[#5ef037] text-[#1a2f1a]" 
                      : "bg-[#1a2f1a] hover:bg-black text-white"
                    }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isAdded ? "check_circle" : "shopping_bag"}
                  </span>
                  {isCurrentAdding ? "Adding..." : isAdded ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
