import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useOrder, type OrderPayload } from "@/hooks/useOrder";
import { Link } from "react-router-dom";

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createOrder, isCreating } = useOrder();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card">("Card");

  const [cardInfo] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/26",
    cvc: "123",
  });

  const subtotal =
    cart?.items?.reduce(
      (acc: number, item: any) =>
        acc + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0;
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderPayload: OrderPayload = {
      items: cart.items.map((item: any) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: address,
      paymentMethod: paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      totalPrice: total,
    };

    createOrder(orderPayload);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[80px] text-[#1a2f1a]/10 mb-6">
          shopping_basket
        </span>
        <h2 className="text-2xl font-bold text-[#1a2f1a] mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/dashboard"
          className="text-[#5ef037] font-black uppercase tracking-widest hover:underline"
        >
          Go back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto">
      <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-12">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-16"
      >
        {/* Left Side: Forms */}
        <div className="flex-1 space-y-12">
          {/* Shipping Address */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="size-8 bg-[#1a2f1a] text-white rounded-full flex items-center justify-center text-xs font-black">
                01
              </span>
              <h2 className="text-2xl font-black text-[#1a2f1a]">
                Shipping Sanctuary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
                  Street Address
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 123 Peace Street"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#5ef037] transition-all outline-none font-bold text-[#1a2f1a]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
                  City
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lahore"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#5ef037] transition-all outline-none font-bold text-[#1a2f1a]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
                  Zip Code
                </label>
                <input
                  required
                  type="text"
                  placeholder="54000"
                  value={address.zipCode}
                  onChange={(e) =>
                    setAddress({ ...address, zipCode: e.target.value })
                  }
                  className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#5ef037] transition-all outline-none font-bold text-[#1a2f1a]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#5ef037] transition-all outline-none font-bold text-[#1a2f1a]"
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="size-8 bg-[#1a2f1a] text-white rounded-full flex items-center justify-center text-xs font-black">
                02
              </span>
              <h2 className="text-2xl font-black text-[#1a2f1a]">
                Payment Essence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setPaymentMethod("Card")}
                className={`h-24 px-8 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${
                  paymentMethod === "Card"
                    ? "border-[#5ef037] bg-[#5ef037]/5"
                    : "border-slate-100 hover:border-[#1a2f1a]/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${paymentMethod === "Card" ? "text-[#5ef037]" : "text-[#1a2f1a]/20"}`}
                >
                  credit_card
                </span>
                <div className="text-left">
                  <p className="font-black text-[#1a2f1a]">
                    Credit / Debit Card
                  </p>
                  <p className="text-[10px] font-bold text-[#1a2f1a]/40 uppercase tracking-widest">
                    Instant Activation
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`h-24 px-8 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${
                  paymentMethod === "Cash"
                    ? "border-[#5ef037] bg-[#5ef037]/5"
                    : "border-slate-100 hover:border-[#1a2f1a]/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${paymentMethod === "Cash" ? "text-[#5ef037]" : "text-[#1a2f1a]/20"}`}
                >
                  payments
                </span>
                <div className="text-left">
                  <p className="font-black text-[#1a2f1a]">Cash on Delivery</p>
                  <p className="text-[10px] font-bold text-[#1a2f1a]/40 uppercase tracking-widest">
                    Pay upon arrival
                  </p>
                </div>
              </button>
            </div>

            {paymentMethod === "Card" && (
              <div className="mt-8 p-8 bg-[#1a2f1a] rounded-[2.5rem] text-white space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={cardInfo.number}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-black tracking-[0.2em] outline-none"
                    />
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-white/20">
                      lock
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={cardInfo.expiry}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-black outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                      CVC
                    </label>
                    <input
                      type="password"
                      readOnly
                      value={cardInfo.cvc}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-black outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] font-bold text-white/30 text-center italic">
                  Payment gateway integration coming soon. This is a secure
                  simulation.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-[#f4f5f0] rounded-[2.5rem] p-10 sticky top-28">
            <h2 className="text-2xl font-black text-[#1a2f1a] mb-8">
              Order Harmony
            </h2>

            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item: any) => (
                <div
                  key={item.product?._id}
                  className="flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-16 bg-white rounded-2xl flex items-center justify-center p-2">
                      <img
                        src={item.product?.image}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a2f1a] text-sm">
                        {item.product?.name}
                      </p>
                      <p className="text-[10px] font-medium text-[#1a2f1a]/40">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-[#1a2f1a] text-sm">
                    ${item.product?.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-[#1a2f1a]/5 mb-10">
              <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                <span>Shipping</span>
                <span>${shipping}</span>
              </div>
              <div className="pt-4 flex justify-between text-2xl font-black text-[#1a2f1a]">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-5 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isCreating ? (
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Place Order</span>
                  <span className="material-symbols-outlined">bolt</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-[#1a2f1a]/30 uppercase tracking-widest mt-6">
              Secure Checkout • Satisfaction Guaranteed
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
