import { useState } from "react";
import { Link } from "react-router-dom";
import type { Chair as Sofa } from "@/pages/admin/chairs/cards";
import { useCart } from "@/hooks/useCart";
import ProductRating from "@/components/ProductRating";
import { resolveImageUrl } from "@/utils/imageUrl";

interface SofaProductCardProps {
  sofa: Sofa;
  badge?: "NEW" | "SALE";
}

export default function SofaProductCard({ sofa, badge }: SofaProductCardProps) {
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);
  const productUrl = `/product/${sofa.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { productId: sofa.id },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        },
      },
    );
  };

  const addToCartButtonClass = `px-6 py-2.5 ${
    added ? "bg-[#ff6b35] text-[#1a2f1a]" : "bg-[#1a2f1a] hover:bg-black text-white"
  } text-[12px] font-black uppercase tracking-widest rounded-full shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50`;

  return (
    <div className="group flex flex-col">
      <div className="relative bg-[#f4f5f0] rounded-2xl overflow-hidden aspect-square flex items-center justify-center transition-all duration-500 group-hover:shadow-lg group-hover:shadow-black/5">
        {badge && (
          <div
            className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              badge === "NEW"
                ? "bg-[#ff6b35] text-white"
                : "bg-[#ff6b35] text-white"
            }`}
          >
            {badge}
          </div>
        )}

        {/* Add to Cart overlay — desktop hover only */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || added}
            className={`${addToCartButtonClass} pointer-events-auto`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {added ? "check_circle" : "shopping_bag"}
            </span>
            {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
          </button>
        </div>

        <Link
          to={productUrl}
          className="flex items-center justify-center w-full h-full p-6"
        >
          <img
            src={resolveImageUrl(sofa.image)}
            alt={sofa.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
      </div>

      <Link to={productUrl} className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#1a2f1a] truncate group-hover:text-[#ff6b35] transition-colors">
            {sofa.name}
          </h3>
          <p className="text-[12px] text-[#1a2f1a]/40 font-medium mt-0.5 truncate">
            {sofa.description}
          </p>
          <div className="mt-1">
            <ProductRating
              averageRating={sofa.averageRating}
              ratingCount={sofa.ratingCount}
            />
          </div>
        </div>
        <span className="text-[15px] font-bold text-[#1a2f1a] whitespace-nowrap">
          Rs. {sofa.price}
        </span>
      </Link>

      {/* Add to Cart — mobile */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || added}
        className={`md:hidden mt-3 w-full ${addToCartButtonClass}`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {added ? "check_circle" : "shopping_bag"}
        </span>
        {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
