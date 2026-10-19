import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import ProductCardView from "@/components/ProductCardView";
import type { Product } from "@/types/product";

interface ShopProductCardProps {
  product: Product;
  badge?: "NEW" | "SALE";
  /** The collection's card shape. */
  aspect?: string | null;
  /** The collection's Material Symbols icon, drawn if the photo is unavailable. */
  placeholderIcon?: string;
}

/**
 * The shopper-facing product card, shared by every kind of product. The card
 * itself — photo frame, crop, badges and text — is ProductCardView, the same
 * component the admin renders, so the two always match. This adds what only a
 * shopper gets: it links to the product, and it can be added to the cart.
 */
export default function ShopProductCard({
  product,
  badge,
  aspect,
  placeholderIcon,
}: ShopProductCardProps) {
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);

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

  const addToCartContent = (
    <>
      <span className="material-symbols-outlined text-[15px]">
        {added ? "check_circle" : "shopping_bag"}
      </span>
      {isAdding ? "Adding..." : added ? "Added!" : "Add to Cart"}
    </>
  );

  return (
    <ProductCardView
      product={product}
      aspect={aspect}
      badge={badge}
      placeholderIcon={placeholderIcon}
      href={`/product/${product.id}`}
      // Add to Cart — desktop hover only; the mobile button lives below.
      frameOverlay={
        <div className="absolute inset-x-0 bottom-0 z-20 hidden md:flex justify-center p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || added}
            className={`${addToCartButtonClass} shadow-lg shadow-black/10`}
          >
            {addToCartContent}
          </button>
        </div>
      }
      footer={
        <button
          onClick={handleAddToCart}
          disabled={isAdding || added}
          className={`md:hidden mt-4 w-full ${addToCartButtonClass}`}
        >
          {addToCartContent}
        </button>
      }
    />
  );
}
