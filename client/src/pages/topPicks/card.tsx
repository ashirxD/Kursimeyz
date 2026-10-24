import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCoverImage from "@/components/ProductCoverImage";
import ProductRating from "@/components/ProductRating";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/hooks/useProduct";
import { aspectCss } from "@/utils/productImageDisplay";
import {
  getDiscountPercent,
  getEffectivePrice,
  getProductImages,
  hasDiscount,
} from "@/utils/productPricing";

interface TopPickCardProps {
  product: Product;
  /** Slightly larger type on the home shelf than on the full listing page. */
  isDashboard?: boolean;
  /** The product's collection card shape — the one its shop page uses. */
  aspect?: string | null;
  /** The collection's Material Symbols icon, drawn if the photo is unavailable. */
  placeholderIcon?: string;
}

/**
 * One storefront product card. Lives on its own so the home shelf's carousel and
 * the full Top Picks grid render exactly the same card, and so each card owns its
 * own add-to-cart state instead of the list tracking one id for all of them.
 *
 * The photo frame is the shop card's: the collection's shape, and the crop the
 * admin set for it, drawn by the same ProductCoverImage.
 */
export default function TopPickCard({
  product,
  isDashboard = false,
  aspect,
  placeholderIcon,
}: TopPickCardProps) {
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (event: React.MouseEvent) => {
    // The whole card is a link to the product; the button must not follow it.
    event.preventDefault();
    event.stopPropagation();

    addToCart(
      { productId: product._id },
      {
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        },
      },
    );
  };

  const priceClass = isDashboard ? "text-[15px]" : "text-[14px]";

  return (
    <div className="group flex flex-col h-full">
      {/* Photo frame — the same shape, rounding and border as a shop card's, with
          the admin's crop applied. No hover lift: the home carousel clips it. */}
      <Link
        to={`/product/${product._id}`}
        style={{ aspectRatio: aspectCss(aspect) }}
        className="relative block w-full overflow-hidden rounded-[20px] border border-[#1a2f1a]/[0.06] bg-[#faf9f6] mb-3"
      >
        <ProductCoverImage
          images={getProductImages(product)}
          imageDisplay={product.imageDisplay}
          alt={product.name}
          icon={placeholderIcon}
          showHoverShot={product.hoverPhoto !== false}
          layerClassName="group-hover:scale-[1.03]"
        />
        {hasDiscount(product) && (
          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ff311b] text-white text-[9px] font-black uppercase tracking-wider">
            {getDiscountPercent(product)}% off
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1">
        {/* Name and price share one row */}
        <Link to={`/product/${product._id}`} className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-bold text-[#1a2f1a] group-hover:text-[#ff311b] transition-colors truncate ${priceClass}`}
            >
              {product.name}
            </h3>
            <span
              className={`flex flex-col items-end whitespace-nowrap ${priceClass}`}
            >
              <span className="font-black text-[#ff311b]">
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

        <button
          onClick={handleAddToCart}
          disabled={isAdding || added}
          className={`w-full py-2 px-3 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 mt-auto
            ${
              added
                ? "bg-[#ff311b] text-[#1a2f1a]"
                : "bg-[#1a2f1a] hover:bg-black text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {added ? "check_circle" : "shopping_bag"}
          </span>
          {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
