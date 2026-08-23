import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import ProductCoverImage from "@/components/ProductCoverImage";
import ProductPrice from "@/components/ProductPrice";
import ProductRating from "@/components/ProductRating";
import type { Product } from "@/types/product";
import {
  formatDimensions,
  getDiscountPercent,
  getProductImages,
  hasDiscount,
} from "@/utils/productPricing";

interface ShopProductCardProps {
  product: Product;
  badge?: "NEW" | "SALE";
  /** The collection's Material Symbols icon, drawn if the photo is unavailable. */
  placeholderIcon?: string;
}

/**
 * The shopper-facing product card, shared by every kind of product. The chairs,
 * tables and sofas pages each had a byte-identical copy of this before types
 * became data.
 *
 * The photo is the hero: a fixed 4/3 frame on a warm off-white, contained rather
 * than cropped so a wardrobe and a stool both read as themselves and neither
 * breaks the row. Everything below it is a plain column — name, description,
 * price, rating, dimensions — each line only drawn when the product has one.
 */
export default function ShopProductCard({
  product,
  badge,
  placeholderIcon,
}: ShopProductCardProps) {
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

  const addToCartButtonClass = `px-5 py-2.5 ${
    added ? "bg-[#ff311b] text-white" : "bg-[#1a2f1a] hover:bg-black text-white"
  } text-[11px] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60`;

  return (
    <article className="group flex flex-col h-full min-w-0">
      {/* Image frame — identical dimensions on every card, whatever the photo is. */}
      <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#faf9f6] border border-[#1a2f1a]/[0.06] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-16px_rgba(26,47,26,0.18)] group-hover:border-[#1a2f1a]/10">
        <Link
          to={productUrl}
          aria-label={product.name}
          className="absolute inset-0 block"
        >
          <ProductCoverImage
            images={images}
            alt={product.name}
            icon={placeholderIcon}
            padClassName="p-5 sm:p-6"
            layerClassName="group-hover:scale-[1.03]"
          />
        </Link>

        {resolvedBadge && (
          <span className="absolute top-3 left-3 z-20 pointer-events-none px-2.5 py-1 rounded-full bg-[#ff311b] text-white text-[9px] font-black uppercase tracking-[0.12em] shadow-sm shadow-[#ff311b]/20">
            {resolvedBadge}
          </span>
        )}

        {/* Real information, not decoration: this product has more to look at. */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 z-20 pointer-events-none pl-2 pr-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#1a2f1a]/70 flex items-center gap-1 shadow-sm shadow-black/5">
            <span className="material-symbols-outlined text-[12px]">
              photo_library
            </span>
            <span className="text-[10px] font-black">{images.length}</span>
          </span>
        )}

        {/* Add to Cart — desktop hover only; the mobile button lives below. */}
        <div className="absolute inset-x-0 bottom-0 z-20 hidden md:flex justify-center p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || added}
            className={`${addToCartButtonClass} shadow-lg shadow-black/10`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {added ? "check_circle" : "shopping_bag"}
            </span>
            {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Image → name → description → price → rating → dimensions. */}
      <div className="flex flex-col flex-1 pt-4 px-0.5">
        <Link to={productUrl} className="block min-w-0">
          <h3 className="text-[16px] font-bold text-[#1a2f1a] leading-snug truncate group-hover:text-[#ff311b] transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[13px] text-[#1a2f1a]/40 font-medium mt-1 truncate">
              {product.description}
            </p>
          )}
        </Link>

        <div className="mt-2.5">
          <ProductPrice product={product} size="lg" showPercent={false} />
        </div>

        {/* Both omit themselves when the product has nothing to say, so no card
            carries an empty row — and the dimensions sit on the floor of the
            card, keeping that line level across a row of mismatched products. */}
        <div className="mt-1.5">
          <ProductRating
            averageRating={product.averageRating}
            ratingCount={product.ratingCount}
          />
        </div>

        {dimensions && (
          <p className="mt-auto pt-3 text-[11px] font-bold tracking-wide text-[#1a2f1a]/30 truncate">
            {dimensions}
          </p>
        )}
      </div>

      {/* Add to Cart — mobile */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || added}
        className={`md:hidden mt-4 w-full ${addToCartButtonClass}`}
      >
        <span className="material-symbols-outlined text-[15px]">
          {added ? "check_circle" : "shopping_bag"}
        </span>
        {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
      </button>
    </article>
  );
}
