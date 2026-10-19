import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import ProductCoverImage from "@/components/ProductCoverImage";
import ProductPrice from "@/components/ProductPrice";
import ProductRating from "@/components/ProductRating";
import type { Product } from "@/types/product";
import { aspectCss } from "@/utils/productImageDisplay";
import {
  formatDimensions,
  getDiscountPercent,
  getProductImages,
  hasDiscount,
} from "@/utils/productPricing";

interface ProductCardViewProps {
  product: Product;
  /** The collection's card shape. Every card in a grid shares it. */
  aspect?: string | null;
  badge?: "NEW" | "SALE";
  /** The collection's Material Symbols icon, drawn if the photo is unavailable. */
  placeholderIcon?: string;
  /** Where the card goes when clicked. Omit it for a card that does not navigate. */
  href?: string;
  /** Drawn inside the photo frame, on top of the photo and its badges. */
  frameOverlay?: ReactNode;
  /** Drawn under the text, still inside the card — the buttons of whoever uses it. */
  footer?: ReactNode;
  /**
   * Darker, bolder and tighter text for a working screen. Only the writing
   * changes; the photo frame is untouched, so the card still matches the shop's.
   */
  strong?: boolean;
}

/**
 * The product card, drawn once.
 *
 * The shop and the admin both render this, so the photo frame, its crop, the
 * badges and the text underneath can never drift apart: what the admin sees on
 * their card is what a shopper sees on theirs. The two differ only in what they
 * pass through the slots — the shop adds Add to Cart, the admin adds Edit and
 * Delete under the card and a Top Pick star over the photo.
 *
 * The photo is the hero: a frame whose shape the collection decides (4:3, 1:1,
 * …), identical on every card whatever the photo is, with each photo cropped and
 * positioned inside it by the admin. Everything below is a plain column — name,
 * description, price, rating, dimensions — each line only drawn when the product
 * has one.
 */
export default function ProductCardView({
  product,
  aspect,
  badge,
  placeholderIcon,
  href,
  frameOverlay,
  footer,
  strong = false,
}: ProductCardViewProps) {
  const images = getProductImages(product);
  const discounted = hasDiscount(product);
  const dimensions = formatDimensions(product.dimensions);
  // A live discount always wins over the decorative badge passed by the shop page.
  const resolvedBadge = discounted ? `${getDiscountPercent(product)}% OFF` : badge;

  const cover = (
    <ProductCoverImage
      images={images}
      imageDisplay={product.imageDisplay}
      alt={product.name}
      icon={placeholderIcon}
      showHoverShot={product.hoverPhoto !== false}
      layerClassName="group-hover:scale-[1.03]"
    />
  );

  return (
    <article
      className={`group flex flex-col h-full min-w-0 ${
        strong
          ? // One tinted card, photo on top and details below: the tint is a pale
            // sage, distinct from both the page and the photo's off-white.
            "rounded-[20px] overflow-hidden bg-[#e9eee1] border border-[#1a2f1a]/10 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
          : ""
      }`}
    >
      {/* Photo frame — identical dimensions on every card, whatever the photo is. */}
      <div
        style={{ aspectRatio: aspectCss(aspect) }}
        className={`relative overflow-hidden bg-[#faf9f6] ${
          strong
            ? "border-b border-[#1a2f1a]/[0.08]"
            : "rounded-[20px] border border-[#1a2f1a]/[0.06] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_-16px_rgba(26,47,26,0.18)] group-hover:border-[#1a2f1a]/10"
        }`}
      >
        {href ? (
          <Link
            to={href}
            aria-label={product.name}
            className="absolute inset-0 block"
          >
            {cover}
          </Link>
        ) : (
          <div className="absolute inset-0 block">{cover}</div>
        )}

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

        {frameOverlay}
      </div>

      {/* Image → name → description → price → rating → dimensions. */}
      <div className={`flex flex-col flex-1 ${strong ? "px-4 pt-3" : "px-0.5 pt-4"}`}>
        <CardLink href={href} className="block min-w-0">
          <h3 className="text-[16px] font-bold text-[#1a2f1a] leading-snug truncate group-hover:text-[#ff311b] transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p
              className={`text-[13px] mt-1 truncate ${
                strong
                  ? "text-[#1a2f1a]/75 font-semibold"
                  : "text-[#1a2f1a]/40 font-medium"
              }`}
            >
              {product.description}
            </p>
          )}
        </CardLink>

        <div className={strong ? "mt-1.5" : "mt-2.5"}>
          <ProductPrice product={product} size="lg" showPercent={false} />
        </div>

        {/* Both omit themselves when the product has nothing to say, so no card
            carries an empty row — and the dimensions sit on the floor of the
            card, keeping that line level across a row of mismatched products. */}
        <div className={strong ? "mt-1" : "mt-1.5"}>
          <ProductRating
            averageRating={product.averageRating}
            ratingCount={product.ratingCount}
          />
        </div>

        {dimensions && (
          <p
            className={`mt-auto text-[11px] font-bold tracking-wide truncate ${
              strong ? "pt-2 text-[#1a2f1a]/65" : "pt-3 text-[#1a2f1a]/30"
            }`}
          >
            {dimensions}
          </p>
        )}
      </div>

      {strong ? footer && <div className="px-4 pb-4">{footer}</div> : footer}
    </article>
  );
}

/** A link when the card navigates, a plain block when it does not. */
function CardLink({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
