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
  // Each detail the admin added is its own paragraph; newlines inside one are
  // kept by whitespace-pre-line rather than collapsed into a run-on line.
  const descriptionBlocks = splitDescriptionBlocks(product.description);

  return (
    <div className="pt-20 pb-12 px-5 md:px-8 max-w-[1200px] mx-auto">
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
        <div className="relative w-full max-w-[460px] mx-auto">
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
              <span className="bg-[#ff311b]/10 text-[#ff311b] px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                In Stock
              </span>
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
                    Rs. {getEffectivePrice(product)}
                  </p>
                  {discounted && (
                    <p className="text-base font-bold text-[#1a2f1a]/40 line-through">
                      Rs. {product.price}
                    </p>
                  )}
                </div>
                {discounted && (
                  <p className="text-[11px] font-bold text-[#ff311b]">
                    You save Rs. {product.price - getEffectivePrice(product)}
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
            <div className="flex items-center gap-2">
              <div className="bg-[#f4f5f0] p-1.5 rounded-xl flex items-center">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-10 rounded-lg text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <div className="w-12 text-center text-lg font-black text-[#1a2f1a]">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-10 rounded-lg text-[#1a2f1a] hover:bg-white hover:shadow-sm transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 h-12 rounded-[1.25rem] text-[12px] font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  added
                    ? "bg-[#ff311b] text-[#1a2f1a]"
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
          </div>
        </div>
      </div>
    </div>
  );
}
