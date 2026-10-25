import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProductReviews } from "@/hooks/useProductReviews";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { formatPrice } from "@/utils/formatPrice";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import ProductRating from "@/components/ProductRating";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductFinishSummary from "@/components/ProductFinishSummary";
import { isFinishEmpty, resolveFinish } from "@/utils/productFinish";
import { splitDescriptionBlocks } from "@/utils/productDescription";
import {
  DIMENSION_LABELS,
  getDiscountPercent,
  getEffectivePrice,
  getProductImages,
  hasDimensions,
  hasDiscount,
} from "@/utils/productPricing";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, isProductLoading, productError } = useProduct(id);
  const { productTypes } = useProductTypes();
  const { addToCart, isAdding } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { reviews } = useProductReviews(id);
  const { paymentSettings } = usePaymentSettings();

  useDocumentTitle(product?.name);

  // The sticky mobile bar only appears once the real button has scrolled away,
  // so the two are never on screen together.
  const addButtonRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const target = addButtonRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product?._id]);

  const handleAddToCart = () => {
    if (product?._id) {
      addToCart(
        { productId: product._id, quantity },
        {
          onSuccess: () => {
            setAdded(true);
            setTimeout(() => setAdded(false), 4000);
          },
        },
      );
    }
  };

  if (isProductLoading) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold uppercase tracking-widest">
          Revealing the sanctuary piece...
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-[64px] text-red-100 mb-4">
          error
        </span>
        <h2 className="text-2xl font-bold text-[#1a2f1a] mb-2">
          Product Not Found
        </h2>
        <p className="text-[#1a2f1a]/60 mb-6">
          The sanctuary piece you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // Resolved from the admin's product kinds rather than a hardcoded switch.
  const productKind = productTypes.find((type) => type.slug === product.category);
  const shopLink = productKind
    ? { path: `/shop/${productKind.pluralSlug}`, label: productKind.pluralName }
    : { path: "/top-picks", label: "Top Picks" };
  const productImages = getProductImages(product);
  const discounted = hasDiscount(product);
  // Folds in the legacy single colour for products saved before the finish.
  const finish = resolveFinish(product);
  // Each detail the admin added is its own paragraph; newlines inside one are
  // kept by whitespace-pre-line rather than collapsed into a run-on line.
  const descriptionBlocks = splitDescriptionBlocks(product.description);
  const askLink = buildWhatsAppLink(
    paymentSettings.whatsappNumber,
    `Hi Kursimeyz, I'm interested in "${product.name}" (${window.location.href}). Could you tell me more?`,
  );

  return (
    <div className="pt-20 pb-28 md:pb-12 px-5 md:px-8 max-w-[1200px] mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 mb-6 text-[9px] font-black uppercase tracking-[0.18em] text-[#1a2f1a]/40">
        <Link
          to="/dashboard"
          className="hover:text-[#ff311b] transition-colors"
        >
          Home
        </Link>
        <span className="material-symbols-outlined text-[10px]">
          chevron_right
        </span>
        <Link
          to={shopLink.path}
          className="hover:text-[#ff311b] transition-colors"
        >
          {shopLink.label}
        </Link>
        <span className="material-symbols-outlined text-[10px]">
          chevron_right
        </span>
        <span className="text-[#1a2f1a]">
          {product.subCategory || productKind?.pluralName || product.category}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Left: Product Gallery */}
        <div className="relative w-full max-w-[460px] mx-auto lg:sticky lg:top-24">
          <ProductImageGallery
            key={product._id}
            images={productImages}
            alt={product.name}
          />

          {/* Floating Category Badge */}
          <div className="absolute top-5 left-5 z-10 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-md shadow-black/5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-[#ff311b]">
              verified
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]">
              Premium {productKind?.name || product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col h-full pt-1">
          <div className="mb-6">
            <h1 className="text-[30px] lg:text-[40px] font-black text-[#1a2f1a] tracking-tight leading-[1] mb-3">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {discounted && (
                <span className="bg-[#ff311b] text-white px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                  {getDiscountPercent(product)}% Off
                </span>
              )}
              {product.ratingCount && product.ratingCount > 0 ? (
                <ProductRating
                  averageRating={product.averageRating}
                  ratingCount={product.ratingCount}
                  size="sm"
                />
              ) : (
                <span className="text-[11px] font-bold text-[#1a2f1a]/40">No reviews yet</span>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {descriptionBlocks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                  Philosophy
                </h3>
                <div className="space-y-2 max-w-md">
                  {descriptionBlocks.map((block, index) => (
                    <p
                      key={index}
                      className="text-[15px] text-[#1a2f1a]/70 font-medium leading-relaxed whitespace-pre-line"
                    >
                      {block}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-8">
              {!isFinishEmpty(finish) && (
                <div className="space-y-2">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                    Essence
                  </h3>
                  {/* Stacked, so body and fabric each get their own line with the
                      material spelled out beside the swatch. */}
                  <ProductFinishSummary finish={finish} size="md" layout="stacked" />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                  Investment
                </h3>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p
                    className={`text-2xl font-black ${
                      discounted ? "text-[#ff311b]" : "text-[#1a2f1a]"
                    }`}
                  >
                    {formatPrice(getEffectivePrice(product))}
                  </p>
                  {discounted && (
                    <p className="text-base font-bold text-[#1a2f1a]/40 line-through">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>
                {discounted && (
                  <p className="text-[11px] font-bold text-[#ff311b]">
                    You save {formatPrice(product.price - getEffectivePrice(product))}
                  </p>
                )}
              </div>
            </div>

            {hasDimensions(product.dimensions) && (
              <div className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                  Dimensions
                </h3>
                <dl className="flex flex-wrap gap-2">
                  {DIMENSION_LABELS.filter(
                    ({ key }) => Number(product.dimensions?.[key]) > 0,
                  ).map(({ key, label }) => (
                    <div
                      key={key}
                      className="bg-[#f4f5f0] rounded-xl px-4 py-2.5 min-w-[86px]"
                    >
                      <dt className="text-[9px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-0.5">
                        {label}
                      </dt>
                      <dd className="text-base font-black text-[#1a2f1a]">
                        {product.dimensions?.[key]}
                        <span className="text-[10px] font-bold text-[#1a2f1a]/40 ml-1">
                          {product.dimensions?.unit ?? "cm"}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <div ref={addButtonRef} className="flex items-center gap-2">
              <div className="bg-[#f4f5f0] p-1.5 rounded-xl flex items-center">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="disabled:opacity-30 size-10 rounded-lg text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <div
                  aria-live="polite"
                  className="w-12 text-center text-lg font-black text-[#1a2f1a]"
                >
                  {quantity}
                </div>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="size-10 rounded-lg text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 h-12 rounded-[1.25rem] text-[12px] font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${
                  added
                    ? "bg-[#ff311b] text-white"
                    : "bg-[#1a2f1a] text-white hover:bg-black"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {added ? "check_circle" : "shopping_bag"}
                </span>
                <span>
                  {added ? "Added!" : isAdding ? "Adding..." : "Add to Cart"}
                </span>
              </button>
            </div>

            {added && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest text-[#ff311b] hover:underline"
              >
                View cart
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            )}

            <ul className="pt-3 space-y-2 text-[13px] font-bold text-[#1a2f1a]/60">
              {askLink && (
                <li>
                  <a
                    href={askLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-[#1a2f1a] hover:text-[#25a244] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Ask us about this piece on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* What buyers said */}
      <section aria-labelledby="reviews-heading" className="mt-16 pt-10 border-t border-slate-100 max-w-[760px]">
        <h2
          id="reviews-heading"
          className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a2f1a]/40 mb-6"
        >
          Customer reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm font-bold text-[#1a2f1a]/40">
            No reviews yet. Buyers can rate this piece once it has been delivered.
          </p>
        ) : (
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li key={review._id} className="pb-6 border-b border-slate-50 last:border-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                  <span
                    className="flex text-[#f5a623]"
                    role="img"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        aria-hidden="true"
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: `'FILL' ${star <= review.rating ? 1 : 0}` }}
                      >
                        star
                      </span>
                    ))}
                  </span>
                  <span className="text-[13px] font-black text-[#1a2f1a]">{review.name}</span>
                  <span className="text-[12px] font-bold text-[#1a2f1a]/30">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-[15px] font-medium text-[#1a2f1a]/70 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Mobile: keeps the way to buy in reach once the real button has scrolled
          away. data-sticky-cta lifts the floating WhatsApp button clear of it. */}
      {showStickyBar && (
        <div
          data-sticky-cta
          className="md:hidden fixed inset-x-0 bottom-16 z-[55] bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#1a2f1a]/50 truncate">{product.name}</p>
            <p className={`text-lg font-black leading-tight ${discounted ? "text-[#ff311b]" : "text-[#1a2f1a]"}`}>
              {formatPrice(getEffectivePrice(product))}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`ml-auto h-12 px-6 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white flex items-center gap-2 active:scale-95 transition-all disabled:opacity-70 ${
              added ? "bg-[#ff311b]" : "bg-[#1a2f1a]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {added ? "check_circle" : "shopping_bag"}
            </span>
            {added ? "Added!" : isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
