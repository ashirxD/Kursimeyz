import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import CitySelect from "@/components/CitySelect";
import { findShippingCity, useShippingCities } from "@/hooks/useShippingCities";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatPrice } from "@/utils/formatPrice";
import { loadCheckoutPrefs, saveCheckoutPrefs } from "@/utils/checkoutPrefs";
import { resolveImageUrl } from "@/utils/imageUrl";
import ProductFinishSummary from "@/components/ProductFinishSummary";
import { resolveFinish, type ProductFinish } from "@/utils/productFinish";
import {
  getCoverImage,
  getEffectivePrice,
  hasDiscount,
  type PricedProduct,
} from "@/utils/productPricing";

interface CartLineItem {
  product?: PricedProduct & {
    _id: string;
    name?: string;
    color?: string;
    finish?: ProductFinish | null;
  };
  quantity: number;
}

export default function CartPage() {
  useDocumentTitle("Your cart");

  const { cart, isLoading, updateQuantity, removeFromCart } = useCart();
  const { cities } = useShippingCities();
  // Shared with checkout, so the city picked here is already filled in there.
  const [city, setCity] = useState(() => loadCheckoutPrefs().city);

  // A line whose product was deleted has nothing to show or buy, so it is not
  // counted either (the header badge used to include them).
  const items = ((cart?.items ?? []) as CartLineItem[]).filter(
    (item) => item.product,
  );
  const itemsCount = items.length;

  const subtotal = items.reduce(
    (acc, item) => acc + getEffectivePrice(item.product) * item.quantity,
    0,
  );
  const listTotal = items.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );
  const savings = listTotal - subtotal;
  // Delivery depends on the city. An estimate here saves the surprise at
  // checkout; a city outside the list is quoted after the order is placed.
  const selectedCity = findShippingCity(cities, city);
  const isCustomCity = city.trim().length > 0 && !selectedCity;
  const shipping = selectedCity?.shippingPrice ?? 0;
  const total = subtotal + shipping;

  const handleCityChange = (value: string) => {
    setCity(value);
    saveCheckoutPrefs({ city: value });
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold">
          Loading your sanctuary's cart...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto">
      <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-12">
        Your Shopping Cart
      </h1>

      {itemsCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[80px] text-[#1a2f1a]/10 mb-6">
            shopping_basket
          </span>
          <p className="text-2xl font-bold text-[#1a2f1a]/60 mb-8">
            Your cart is as empty as a minimalist room.
          </p>
          <Link
            to="/dashboard"
            className="px-10 py-4 bg-[#ff311b] text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-lg shadow-[#ff311b]/20"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Items List */}
          <div className="flex-1 space-y-8">
            {items.map((item) => {
              const product = item.product;
              // A line whose product no longer exists has no usable controls.
              if (!product) return null;

              const unitPrice = getEffectivePrice(product);
              const itemTotal = unitPrice * item.quantity;
              const discounted = hasDiscount(product);

              return (
                <div key={product._id} className="flex gap-6 group">
                  <div className="size-32 bg-[#f4f5f0] rounded-3xl overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={resolveImageUrl(getCoverImage(product))}
                      alt={product.name || "Product"}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#1a2f1a]">
                          {product.name || "Unknown Product"}
                        </h3>
                        <ProductFinishSummary
                          finish={resolveFinish(product)}
                          size="xs"
                          showLabels={false}
                          className="mt-1"
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-lg font-black ${
                            discounted ? "text-[#ff311b]" : "text-[#1a2f1a]"
                          }`}
                        >
                          {formatPrice(itemTotal)}
                        </p>
                        {discounted && (
                          <p className="text-[12px] font-bold text-[#1a2f1a]/40 line-through">
                            {formatPrice((product.price || 0) * item.quantity)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-[11px] font-bold text-[#1a2f1a]/40">
                            {formatPrice(unitPrice)} each
                          </p>
                        )}
                      </div>
                    </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1 bg-[#f4f5f0] rounded-full px-1 py-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name || "item"}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity({
                            productId: product._id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        className="size-9 rounded-full flex items-center justify-center material-symbols-outlined text-[18px] text-[#1a2f1a]/60 hover:text-[#1a2f1a] hover:bg-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        remove
                      </button>
                      <span
                        aria-live="polite"
                        className="text-[14px] font-black text-[#1a2f1a] w-7 text-center"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name || "item"}`}
                        onClick={() =>
                          updateQuantity({
                            productId: product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="size-9 rounded-full flex items-center justify-center material-symbols-outlined text-[18px] text-[#1a2f1a]/60 hover:text-[#1a2f1a] hover:bg-white transition-colors"
                      >
                        add
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${product.name || "item"} from cart`}
                      onClick={() => removeFromCart(product._id)}
                      className="text-[12px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5 py-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-[#1a2f1a] rounded-[2.5rem] p-10 text-white sticky top-28">
              <h2 className="text-2xl font-black mb-8">Summary</h2>

              {/* Light panel inside the dark card, so the field keeps its contrast. */}
              <div className="bg-white rounded-3xl p-4 mb-6">
                <CitySelect
                  label="Estimate delivery to"
                  placeholder="Your city, e.g. Lahore"
                  value={city}
                  cities={cities}
                  onChange={handleCityChange}
                />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/60 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-[#ff311b] font-bold">
                    <span>Discount savings</span>
                    <span>- {formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-white/60 font-medium">
                  <span>Delivery</span>
                  {selectedCity ? (
                    <span className="text-white">{formatPrice(shipping)}</span>
                  ) : isCustomCity ? (
                    <span className="text-right text-white/80">
                      Quoted after you order
                    </span>
                  ) : (
                    <span className="text-white/40">Choose your city</span>
                  )}
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between text-xl font-black">
                  <span>{selectedCity ? "Total" : "Subtotal"}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-5 bg-[#ff311b] text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 mb-6"
              >
                <span>Checkout Now</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>

              <Link
                to="/dashboard"
                className="w-full py-4 text-center text-white/40 hover:text-white transition-colors text-[12px] font-black uppercase tracking-widest block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
