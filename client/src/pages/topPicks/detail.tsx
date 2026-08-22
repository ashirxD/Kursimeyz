import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/hooks/useCart";
import { useProductTypes } from "@/hooks/useProductTypes";
import { useState } from "react";
import { Link } from "react-router-dom";
import ProductRating from "@/components/ProductRating";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductFinishSummary from "@/components/ProductFinishSummary";
import { isFinishEmpty, resolveFinish } from "@/utils/productFinish";
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

  const handleAddToCart = () => {
    if (product?._id) {
      addToCart(
        { productId: product._id, quantity },
        {
          onSuccess: () => {
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
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

  return (
    <div className="pt-24 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a2f1a]/40">
        <Link
          to="/dashboard"
          className="hover:text-[#ff6b35] transition-colors"
        >
          Home
        </Link>
        <span className="material-symbols-outlined text-[12px]">
          chevron_right
        </span>
        <Link
          to={shopLink.path}
          className="hover:text-[#ff6b35] transition-colors"
        >
          {shopLink.label}
        </Link>
        <span className="material-symbols-outlined text-[12px]">
          chevron_right
        </span>
        <span className="text-[#1a2f1a]">
          {product.subCategory || productKind?.pluralName || product.category}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Left: Product Gallery */}
        <div className="relative">
          <ProductImageGallery
            key={product._id}
            images={productImages}
            alt={product.name}
          />

          {/* Floating Category Badge */}
          <div className="absolute top-8 left-8 z-10 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-lg shadow-black/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#ff6b35]">
              verified
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]">
              Premium {productKind?.name || product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col h-full pt-4">
          <div className="mb-10">
            <h1 className="text-[44px] lg:text-[64px] font-black text-[#1a2f1a] tracking-tight leading-[0.95] mb-6">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <span className="bg-[#ff6b35]/10 text-[#ff6b35] px-5 py-1.5 rounded-full text-[13px] font-black tracking-widest uppercase">
                In Stock
              </span>
              {discounted && (
                <span className="bg-[#ff6b35] text-white px-5 py-1.5 rounded-full text-[13px] font-black tracking-widest uppercase">
                  {getDiscountPercent(product)}% Off
                </span>
              )}
              {product.ratingCount && product.ratingCount > 0 ? (
                <ProductRating
                  averageRating={product.averageRating}
                  ratingCount={product.ratingCount}
                  size="md"
                />
              ) : (
                <span className="text-sm font-bold text-[#1a2f1a]/40">No reviews yet</span>
              )}
            </div>
          </div>

          <div className="space-y-12 mb-16">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                Philosophy
              </h3>
              <p className="text-xl text-[#1a2f1a]/70 font-medium leading-relaxed max-w-lg">
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-12">
              {!isFinishEmpty(finish) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                    Essence
                  </h3>
                  {/* Stacked, so body and fabric each get their own line with the
                      material spelled out beside the swatch. */}
                  <ProductFinishSummary finish={finish} size="lg" layout="stacked" />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                  Investment
                </h3>
                <div className="flex flex-wrap items-baseline gap-3">
                  <p
                    className={`text-3xl font-black ${
                      discounted ? "text-[#ff6b35]" : "text-[#1a2f1a]"
                    }`}
                  >
                    Rs. {getEffectivePrice(product)}
                  </p>
                  {discounted && (
                    <p className="text-lg font-bold text-[#1a2f1a]/40 line-through">
                      Rs. {product.price}
                    </p>
                  )}
                </div>
                {discounted && (
                  <p className="text-[12px] font-bold text-[#ff6b35]">
                    You save Rs. {product.price - getEffectivePrice(product)}
                  </p>
                )}
              </div>
            </div>

            {hasDimensions(product.dimensions) && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                  Dimensions
                </h3>
                <dl className="flex flex-wrap gap-3">
                  {DIMENSION_LABELS.filter(
                    ({ key }) => Number(product.dimensions?.[key]) > 0,
                  ).map(({ key, label }) => (
                    <div
                      key={key}
                      className="bg-[#f4f5f0] rounded-2xl px-6 py-4 min-w-[110px]"
                    >
                      <dt className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-1">
                        {label}
                      </dt>
                      <dd className="text-xl font-black text-[#1a2f1a]">
                        {product.dimensions?.[key]}
                        <span className="text-[12px] font-bold text-[#1a2f1a]/40 ml-1">
                          {product.dimensions?.unit ?? "cm"}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-[#f4f5f0] p-2 rounded-2xl flex items-center">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-12 rounded-xl text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <div className="w-16 text-center text-xl font-black text-[#1a2f1a]">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-12 rounded-xl text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 h-14 rounded-[1.5rem] font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-3 ${
                  added
                    ? "bg-[#ff6b35] text-[#1a2f1a]"
                    : "bg-[#1a2f1a] text-white hover:bg-black"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {added ? "check_circle" : "shopping_bag"}
                </span>
                <span>
                  {added ? "Added!" : isAdding ? "Adding..." : "Add to Cart"}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-[#1a2f1a]/40 font-medium text-center italic">
              * Complimented with free luxury shipping across Pakistan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
