import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeFromCart, itemsCount } =
    useCart();

  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  const subtotal =
    cart?.items?.reduce(
      (acc: number, item: any) =>
        acc + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0;
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

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
            className="px-10 py-4 bg-[#5ef037] text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-lg shadow-[#5ef037]/20"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Items List */}
          <div className="flex-1 space-y-8">
            {cart.items.map((item: any) => (
              <div
                key={item.product?._id || Math.random()}
                className="flex gap-6 group"
              >
                <div className="size-32 bg-[#f4f5f0] rounded-3xl overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.name || "Product"}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-[#1a2f1a]">
                        {item.product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-[#1a2f1a]/40 font-medium">
                        {item.product?.color}
                      </p>
                    </div>
                    <p className="text-lg font-black text-[#1a2f1a]">
                      Rs. {item.product?.price || 0}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 bg-[#f4f5f0] rounded-full px-4 py-2">
                      <button
                        onClick={() =>
                          updateQuantity({
                            productId: item.product._id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        className="material-symbols-outlined text-[18px] text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors"
                      >
                        remove
                      </button>
                      <span className="text-[14px] font-black text-[#1a2f1a] w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity({
                            productId: item.product._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="material-symbols-outlined text-[18px] text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors"
                      >
                        add
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-[12px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <div className="bg-[#1a2f1a] rounded-[2.5rem] p-10 text-white sticky top-28">
              <h2 className="text-2xl font-black mb-8">Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[#white]/60 font-medium">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-[#white]/60 font-medium">
                  <span>Shipping</span>
                  <span>Rs. {shipping}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between text-xl font-black">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full py-5 bg-[#5ef037] text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3 mb-6"
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
