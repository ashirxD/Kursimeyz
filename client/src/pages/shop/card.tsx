import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import ProductRating from "@/components/ProductRating";
import ProductPrice from "@/components/ProductPrice";
import type { Product } from "@/types/product";
import { resolveImageUrl } from "@/utils/imageUrl";
import {
  formatDimensions,
  getDiscountPercent,
  getProductImages,
  hasDiscount,
} from "@/utils/productPricing";

interface ShopProductCardProps {
  product: Product;
  badge?: "NEW" | "SALE";
}

/**
 * The shopper-facing product card, shared by every kind of product. The chairs,
 * tables and sofas pages each had a byte-identical copy of this before types
 * became data.
 */
export default function ShopProductCard({ product, badge }: ShopProductCardProps) {
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);
  const productUrl = `/product/${product.id}`;
  const images = getProductImages(product);
  const discounted = hasDiscount(product);
  const dimensions = formatDimensions(product.dimensions);
  // A live discount always wins over the decorative badge passed by the shop page.
  const resolvedBadge = discounted ? `${getDiscountPercent(product)}% OFF` : badge;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { productId: product.id },
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
        {resolvedBadge && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff6b35] text-white">
            {resolvedBadge}
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#1a2f1a] flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">
              photo_library
            </span>
            <span className="text-[10px] font-black">{images.length}</span>
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
          className="relative flex items-center justify-center w-full h-full p-6"
        >
          <img
            src={resolveImageUrl(images[0])}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-110 ${
              images.length > 1 ? "group-hover:opacity-0" : ""
            }`}
          />
          {/* Second shot previews on hover, the way most storefronts do it. */}
          {images.length > 1 && (
            <img
              src={resolveImageUrl(images[1])}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-contain p-6 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
            />
          )}
        </Link>
      </div>

      <Link to={productUrl} className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-[#1a2f1a] truncate group-hover:text-[#ff6b35] transition-colors">
            {product.name}
          </h3>
          <p className="text-[12px] text-[#1a2f1a]/40 font-medium mt-0.5 truncate">
            {product.description}
          </p>
          {dimensions && (
            <p className="text-[11px] text-[#1a2f1a]/30 font-bold mt-0.5 truncate">
              {dimensions}
            </p>
          )}
          <div className="mt-1">
            <ProductRating
              averageRating={product.averageRating}
              ratingCount={product.ratingCount}
            />
          </div>
        </div>
        <ProductPrice
          product={product}
          size="md"
          layout="stacked"
          showPercent={false}
          className="shrink-0"
        />
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
