import { useState } from "react";
import type { Chair as Table } from "@/pages/admin/chairs/cards";
import { useCart } from "@/hooks/useCart";

interface TableProductCardProps {
  table: Table;
  badge?: "NEW" | "SALE";
}

export default function TableProductCard({
  table,
  badge,
}: TableProductCardProps) {
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding Table to cart, product ID:", table.id);
    addToCart(
      { productId: table.id },
      {
        onSuccess: () => {
          console.log("Successfully added Table to cart");
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        },
        onError: (err) => {
          console.error("Failed to add Table to cart:", err);
        },
      },
    );
  };

  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative bg-[#f4f5f0] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-black/5">
        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              badge === "NEW"
                ? "bg-[#5ef037] text-white"
                : "bg-[#5ef037] text-white"
            }`}
          >
            {badge}
          </div>
        )}

        {/* Add to Cart Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || added}
            className={`px-6 py-2.5 ${added ? "bg-[#5ef037] text-[#1a2f1a]" : "bg-[#1a2f1a] hover:bg-black text-white"} text-[12px] font-black uppercase tracking-widest rounded-full shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {added ? "check_circle" : "shopping_bag"}
            </span>
            {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
          </button>
        </div>

        {/* Product Image */}
        <img
          src={getImageUrl(table.image)}
          alt={table.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Product Info */}
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#1a2f1a] truncate">
            {table.name}
          </h3>
          <p className="text-[12px] text-[#1a2f1a]/40 font-medium mt-0.5 truncate">
            {table.description}
          </p>
        </div>
        <span className="text-[15px] font-bold text-[#1a2f1a] whitespace-nowrap">
          Rs. {table.price}
        </span>
      </div>
    </div>
  );
}
