import { Link } from "react-router-dom";

export default function OrderSuccessPage() {
  return (
    <div className="pt-32 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto flex flex-col items-center justify-center text-center">
      <div className="size-24 bg-[#5ef037]/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <span className="material-symbols-outlined text-[48px] text-[#5ef037] font-black">
          check_circle
        </span>
      </div>

      <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-6">
        Order Confirmed
      </h1>

      <p className="text-xl text-[#1a2f1a]/60 font-medium max-w-xl mb-12">
        Your order has been placed successfully in our sanctuary. We'll start
        preparing your peace of mind immediately.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          to="/dashboard"
          className="px-10 py-4 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl shadow-black/10"
        >
          Continue Shopping
        </Link>
        <Link
          to="/dashboard" // We can link to "My Orders" later
          className="px-10 py-4 border-2 border-slate-100 text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:border-[#1a2f1a] transition-all"
        >
          Back to Home
        </Link>
      </div>

      <div className="mt-20 p-8 bg-[#f4f5f0] rounded-[2.5rem] max-w-2xl w-full">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1a2f1a]/40 mb-4">
          What's Next?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <span className="material-symbols-outlined text-[#5ef037]">
              mail
            </span>
            <p className="text-xs font-bold text-[#1a2f1a]">
              Check your email for confirmation
            </p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-[#5ef037]">
              inventory_2
            </span>
            <p className="text-xs font-bold text-[#1a2f1a]">
              We'll process your order soon
            </p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-[#5ef037]">
              local_shipping
            </span>
            <p className="text-xs font-bold text-[#1a2f1a]">
              Fast & secure shipping delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
