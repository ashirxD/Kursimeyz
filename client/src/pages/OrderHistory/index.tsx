import { useOrder } from "@/hooks/useOrder";
import { Link } from "react-router-dom";

export default function OrderHistory() {
  const { myOrders, ordersLoading, ordersError } = useOrder();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (ordersLoading) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center">
        <div className="animate-pulse text-[#1a2f1a]/40 font-bold">
          Retrieving your order sanctuary...
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="pt-32 pb-16 flex flex-col items-center justify-center text-center px-6">
        <span className="material-symbols-outlined text-[64px] text-red-100 mb-4">
          error
        </span>
        <h2 className="text-2xl font-bold text-[#1a2f1a] mb-2">
          Something went wrong
        </h2>
        <p className="text-[#1a2f1a]/60 mb-6">
          We couldn't load your order history. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-6 md:px-10 max-w-[1240px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-4">
            Order History
          </h1>
          <p className="text-lg text-[#1a2f1a]/50 font-medium">
            Track your peace of mind and past sanctuary additions.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[#5ef037] font-black uppercase tracking-widest hover:underline"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Order
        </Link>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-[#f4f5f0] rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center">
          <div className="size-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-[#1a2f1a]/10">
              history
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#1a2f1a] mb-2">
            No orders yet
          </h2>
          <p className="text-[#1a2f1a]/40 font-medium mb-8 max-w-sm">
            Your history is currently a blank canvas. Time to add some comfort
            to your space.
          </p>
          <Link
            to="/dashboard"
            className="px-10 py-4 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {myOrders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
            >
              {/* Order Header */}
              <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                      Order Date
                    </p>
                    <p className="font-bold text-[#1a2f1a]">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                      Total Amount
                    </p>
                    <p className="font-black text-[#1a2f1a]">
                      Rs. {order.totalPrice}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                      Order ID
                    </p>
                    <p className="font-medium text-[#1a2f1a]/60 font-mono text-sm">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  {order.isPaid && (
                    <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#5ef037]/10 text-[#5ef037]">
                      Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[#1a2f1a]/20">
                        inventory_2
                      </span>
                      <h3 className="text-sm font-black uppercase tracking-widest text-[#1a2f1a]">
                        Items
                      </h3>
                    </div>
                    {order.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0"
                      >
                        <div className="size-20 bg-[#f4f5f0] rounded-2xl flex-shrink-0 flex items-center justify-center p-3">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1a2f1a]">
                            {item.product?.name || "Sanctuary Addition"}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs font-medium text-[#1a2f1a]/40">
                              Qty: {item.quantity}
                            </p>
                            <span className="size-1 bg-slate-200 rounded-full"></span>
                            <p className="text-xs font-black text-[#1a2f1a]/60">
                              Rs. {item.price}
                            </p>
                          </div>
                        </div>
                        <p className="font-black text-[#1a2f1a]">
                          Rs. {item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-[#f4f5f0]/50 rounded-[2rem] p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#1a2f1a]/20 text-xl">
                          local_shipping
                        </span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]">
                          Shipping Destination
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-[#1a2f1a]">
                          {order.shippingAddress.street}
                        </p>
                        <p className="text-[#1a2f1a]/60 font-medium">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-[#1a2f1a]/60 font-medium mt-2">
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="px-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#1a2f1a]/20 text-xl">
                          payments
                        </span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]">
                          Payment Essence
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#1a2f1a]">
                          {order.paymentMethod}
                        </p>
                        <p
                          className={`text-xs font-black uppercase tracking-widest ${order.isPaid ? "text-[#5ef037]" : "text-orange-500"}`}
                        >
                          {order.isPaid ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
