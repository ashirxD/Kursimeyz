import { useMemo, useState } from "react";
import { useProduct, type Product } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import ProductRating from "@/components/ProductRating";
import { resolveImageUrl } from "@/utils/imageUrl";
import {
  getCoverImage,
  getDiscountPercent,
  getEffectivePrice,
  hasDiscount,
} from "@/utils/productPricing";

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

  const displayProducts = useMemo(() => {
    const allProducts = Object.values(groupedProducts).flat() as Product[];
    const randomizedProducts = [...allProducts].sort(() => 0.5 - Math.random());

    return limit ? randomizedProducts.slice(0, limit) : randomizedProducts;
  }, [groupedProducts, limit]);

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
            addToCart(
              { productId: product._id },
              {
                onSuccess: () => {
                  setAddedProductId(product._id);
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
                className="relative block w-full aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3"
              >
                <img
                  src={resolveImageUrl(getCoverImage(product))}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {hasDiscount(product) && (
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ff6b35] text-white text-[9px] font-black uppercase tracking-wider">
                    {getDiscountPercent(product)}% off
                  </span>
                )}
              </Link>

              {/* Content - Fixed structure */}
              <div className="flex flex-col flex-1">
                {/* Name and Price in one row */}
                <Link to={`/product/${product._id}`} className="mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold text-[#1a2f1a] group-hover:text-[#ff6b35] transition-colors truncate
                      ${isDashboard ? "text-[15px]" : "text-[14px]"}`}
                    >
                      {product.name}
                    </h3>
                    <span
                      className={`flex flex-col items-end whitespace-nowrap
                      ${isDashboard ? "text-[15px]" : "text-[14px]"}`}
                    >
                      <span className="font-black text-[#d27d53]">
                        {getEffectivePrice(product)} Rs
                      </span>
                      {hasDiscount(product) && (
                        <span className="text-[11px] font-bold text-[#1a2f1a]/40 line-through leading-none">
                          {product.price} Rs
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProductRating
                      averageRating={product.averageRating}
                      ratingCount={product.ratingCount}
                    />
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isCurrentAdding || isAdded}
                  className={`w-full py-2 px-3 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 mt-auto
                    ${isAdded 
                      ? "bg-[#ff6b35] text-[#1a2f1a]" 
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
