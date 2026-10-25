import { useOrder } from "@/hooks/useOrder";
import { Link } from "react-router-dom";
import { usePendingReviews } from "@/hooks/usePendingReviews";
import { useReviewPrompt } from "@/components/ReviewPromptProvider";
import { isDisplayableImageUrl, resolveImageUrl } from "@/utils/imageUrl";
import { formatPrice } from "@/utils/formatPrice";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import { getCoverImage } from "@/utils/productPricing";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { orderLabel } from "@/utils/orderNumber";
import ProductFinishSummary from "@/components/ProductFinishSummary";
import { resolveFinish } from "@/utils/productFinish";

// The happy path an order walks, in order. Cancelled sits outside it.
const PROGRESS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"] as const;

function OrderProgress({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <p className="text-sm font-bold text-red-600">
        This order was cancelled. Message us if that wasn't expected.
      </p>
    );
  }

  const current = Math.max(0, PROGRESS_STEPS.indexOf(status as (typeof PROGRESS_STEPS)[number]));

  return (
    <ol className="flex items-center" aria-label="Order progress">
      {PROGRESS_STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step}
            aria-current={index === current ? "step" : undefined}
            className={`flex items-center ${index < PROGRESS_STEPS.length - 1 ? "flex-1" : ""}`}
          >
            <span className="flex flex-col items-center gap-1.5">
              <span
                className={`size-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                  done ? "bg-[#1a2f1a] text-white" : "bg-slate-100 text-[#1a2f1a]/30"
                }`}
              >
                {done ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wide ${
                  done ? "text-[#1a2f1a]" : "text-[#1a2f1a]/30"
                }`}
              >
                {step === "Pending" ? "Placed" : step}
              </span>
            </span>
            {index < PROGRESS_STEPS.length - 1 && (
              <span
                className={`h-0.5 flex-1 mx-2 mb-5 rounded-full ${
                  index < current ? "bg-[#1a2f1a]" : "bg-slate-100"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderHistory() {
  useDocumentTitle("My orders");

  const { myOrders, ordersLoading, ordersError } = useOrder();
  const { paymentSettings } = usePaymentSettings();

  // Where a shopper who has paid by wallet or bank sends the screenshot.
  const paymentLink = (order: { _id: string; orderNumber?: string; totalPrice: number; paymentMethod: string }) =>
    buildWhatsAppLink(
      paymentSettings.whatsappNumber,
      `Hi Kursimeyz, I paid for order ${orderLabel(order, 8)} (${formatPrice(order.totalPrice)}) by ${order.paymentMethod}. Sending the screenshot now.`,
    );
  const { pendingOrders } = usePendingReviews();
  const { openReviewForOrder } = useReviewPrompt();

  const pendingOrderIds = new Set(pendingOrders.map((o) => o.orderId));

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
          Loading your orders...
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
            Track your orders and see what you've bought before.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[#ff311b] font-black uppercase tracking-widest hover:underline"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Order
        </Link>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-[#f4f5f0] rounded-5xl py-20 flex flex-col items-center justify-center text-center">
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
              className="bg-white rounded-5xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
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
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
                      Order ID
                    </p>
                    <p className="font-medium text-[#1a2f1a]/60 font-mono text-sm">
                      {orderLabel(order, 8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  {order.isPaid && (
                    <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ff311b]/10 text-[#ff311b]">
                      Paid
                    </span>
                  )}
                  {order.status === "Delivered" && pendingOrderIds.has(order._id) && (
                    <button
                      type="button"
                      onClick={() => openReviewForOrder(order._id)}
                      className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Rate Products
                    </button>
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="pb-6 mb-2 border-b border-slate-50">
                      <OrderProgress status={order.status} />
                    </div>
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
                        <div className="flex size-16 sm:size-20 bg-[#f4f5f0] rounded-2xl shrink-0 items-center justify-center p-3">
                          {isDisplayableImageUrl(getCoverImage(item.product)) ? (
                            <img
                              src={resolveImageUrl(getCoverImage(item.product))}
                              alt={item.product?.name ?? ""}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            // A removed product shows a quiet placeholder rather
                            // than a stock photo of somebody else's furniture.
                            <span className="material-symbols-outlined text-[28px] text-[#1a2f1a]/20">
                              chair
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1a2f1a]">
                            {item.product?.name || "Item no longer sold"}
                          </h4>
                          {/* The order's own snapshot, so this stays what was
                              actually bought even if the product changes later. */}
                          <ProductFinishSummary
                            finish={resolveFinish(item)}
                            size="xs"
                            showLabels={false}
                            className="mt-1.5"
                          />
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs font-medium text-[#1a2f1a]/40">
                              Qty: {item.quantity}
                            </p>
                            <span className="size-1 bg-slate-200 rounded-full"></span>
                            <p className="text-xs font-black text-[#1a2f1a]/60">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <p className="font-black text-[#1a2f1a]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-[#f4f5f0]/50 rounded-4xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#1a2f1a]/20 text-xl">
                          local_shipping
                        </span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]">
                          Delivering to
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
                        {order.isCustomShippingCity && (
                          <p className="flex gap-2 pt-3 text-[12px] font-medium text-[#ff311b]">
                            <span className="material-symbols-outlined text-[16px] shrink-0">
                              info
                            </span>
                            <span>
                              Shipping for this city is confirmed separately, so
                              it isn't included in the total above.
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="px-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#1a2f1a]/20 text-xl">
                          payments
                        </span>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]">
                          Payment
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#1a2f1a]">
                          {order.paymentMethod}
                        </p>
                        <p
                          className={`text-xs font-black uppercase tracking-widest ${order.isPaid ? "text-[#ff311b]" : "text-orange-500"}`}
                        >
                          {order.isPaid ? "Received" : "Awaiting payment"}
                        </p>
                      </div>
                      {!order.isPaid &&
                        order.status !== "Cancelled" &&
                        order.paymentMethod !== "Cash" &&
                        paymentLink(order) && (
                          <a
                            href={paymentLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#ff311b] hover:underline"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                            Send payment screenshot
                          </a>
                        )}
                      {order.paymentMethod === "Cash" && !order.isPaid && (
                        <p className="mt-2 text-[12px] font-medium text-[#1a2f1a]/50">
                          Pay {formatPrice(order.totalPrice)} when it arrives.
                        </p>
                      )}
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
