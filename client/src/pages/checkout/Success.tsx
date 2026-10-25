import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatPrice } from "@/utils/formatPrice";
import { orderLabel } from "@/utils/orderNumber";
import { buildWhatsAppLink } from "@/utils/whatsapp";

interface PlacedOrder {
  _id: string;
  orderNumber?: string;
  paymentMethod: "Cash" | "Card" | "Easypaisa" | "JazzCash" | "Bank";
  totalPrice: number;
  isCustomShippingCity?: boolean;
  shippingAddress?: { city?: string };
}

/** Only ever send someone to a real web address, never a javascript: or data: one. */
const safeHttpsUrl = (url?: string) => (url && /^https:\/\//i.test(url) ? url : "");

export default function OrderSuccessPage() {
  useDocumentTitle("Order placed");

  const location = useLocation();
  const order = (location.state as { order?: PlacedOrder } | null)?.order;
  const { paymentSettings } = usePaymentSettings();

  // Without the order (the page was opened directly) there is nothing specific
  // to show, but the shopper still deserves a way to find it.
  if (!order) {
    return (
      <div className="pt-32 pb-16 px-6 flex flex-col items-center text-center">
        <h1 className="text-[34px] font-black text-[#1a2f1a] mb-4">
          Looking for your order?
        </h1>
        <p className="text-[#1a2f1a]/60 font-medium max-w-md mb-8">
          Every order you have placed, with its status and payment details, is
          listed under My Orders.
        </p>
        <Link
          to="/orders"
          className="px-10 py-4 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-colors"
        >
          View my orders
        </Link>
      </div>
    );
  }

  const label = orderLabel(order, 8);
  const total = formatPrice(order.totalPrice);
  const method = order.paymentMethod;
  const isWallet = method === "Easypaisa" || method === "JazzCash";
  const walletAccount =
    method === "Easypaisa"
      ? paymentSettings.easypaisaAccountNumber
      : paymentSettings.jazzcashAccountNumber;
  const walletUrl = safeHttpsUrl(
    method === "Easypaisa"
      ? paymentSettings.easypaisaRedirectUrl
      : paymentSettings.jazzcashRedirectUrl,
  );

  const needsPayment = isWallet || method === "Bank";
  const whatsappLink = buildWhatsAppLink(
    paymentSettings.whatsappNumber,
    needsPayment
      ? `Hi Kursimeyz, I placed order ${label} and paid ${total} by ${method}. I'm sending the payment screenshot.`
      : `Hi Kursimeyz, I placed order ${label}. I have a question about it.`,
  );

  return (
    <div className="pt-28 pb-16 px-6 md:px-10 max-w-[760px] mx-auto">
      <div className="text-center mb-10">
        <div className="size-20 bg-[#ff311b]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[44px] text-[#ff311b]">
            check_circle
          </span>
        </div>
        <h1 className="text-[36px] lg:text-[48px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-3">
          Order placed
        </h1>
        <p className="text-lg text-[#1a2f1a]/60 font-medium">
          Thank you. Your order number is{" "}
          <span className="font-black text-[#1a2f1a] font-mono">{label}</span>.
        </p>
        <p className="text-sm text-[#1a2f1a]/40 font-medium mt-1">
          A confirmation has been emailed to you.
        </p>
      </div>

      {/* What to do about payment */}
      <section className="bg-[#f4f5f0] rounded-4xl p-6 md:p-8 mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-2">
          Amount {method === "Cash" ? "to pay on delivery" : "to pay"}
        </p>
        <p className="text-3xl font-black text-[#1a2f1a] mb-5">{total}</p>

        {method === "Cash" && (
          <p className="text-sm font-bold text-[#1a2f1a]/60 leading-relaxed">
            Nothing to pay now. Please keep the exact amount ready for when your
            order arrives.
          </p>
        )}

        {isWallet && (
          <div className="space-y-4">
            {walletAccount ? (
              <CopyRow label={`${method} account`} value={walletAccount} />
            ) : (
              <p className="text-sm font-bold text-[#1a2f1a]/60">
                We'll message you the {method} account details shortly.
              </p>
            )}
            <ol className="text-sm font-bold text-[#1a2f1a]/60 space-y-1.5 list-decimal pl-5">
              <li>
                Send {total} to the {method} account above.
              </li>
              <li>
                Send the payment screenshot on WhatsApp, quoting{" "}
                <span className="text-[#1a2f1a]">{label}</span>.
              </li>
              <li>We confirm your payment and start preparing your order.</li>
            </ol>
            {walletUrl && (
              <a
                href={walletUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#ff311b] hover:underline"
              >
                Open the {method} app
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            )}
          </div>
        )}

        {method === "Bank" && (
          <div className="space-y-4">
            {paymentSettings.bankAccountNumber ? (
              <>
                {paymentSettings.bankName && (
                  <InfoRow label="Bank" value={paymentSettings.bankName} />
                )}
                {paymentSettings.bankAccountTitle && (
                  <InfoRow label="Account title" value={paymentSettings.bankAccountTitle} />
                )}
                <CopyRow label="Account number" value={paymentSettings.bankAccountNumber} />
              </>
            ) : (
              <p className="text-sm font-bold text-[#1a2f1a]/60">
                We'll message you the bank details shortly.
              </p>
            )}
            <p className="text-sm font-bold text-[#1a2f1a]/60 leading-relaxed">
              After transferring, send the receipt on WhatsApp quoting{" "}
              <span className="text-[#1a2f1a]">{label}</span>.
            </p>
          </div>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full py-4 bg-[#25D366] text-white rounded-full font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 hover:brightness-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            {needsPayment ? "Send payment screenshot" : "Message us on WhatsApp"}
          </a>
        )}
      </section>

      {order.isCustomShippingCity && (
        <section className="flex gap-4 p-5 mb-6 rounded-2xl bg-[#ff311b]/5 border border-[#ff311b]/20">
          <span className="material-symbols-outlined text-[22px] text-[#ff311b] shrink-0">
            local_shipping
          </span>
          <p className="text-sm font-medium text-[#1a2f1a]/70 leading-relaxed">
            Delivery to {order.shippingAddress?.city || "your city"} isn't in the
            total above. We'll contact you to agree the delivery charge before
            anything ships.
          </p>
        </section>
      )}

      {/* What happens next */}
      <section className="mb-10">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a2f1a]/40 mb-4">
          What happens next
        </h2>
        <ol className="space-y-3">
          {[
            needsPayment
              ? "We confirm your payment."
              : "We call or message you to confirm the order and delivery time.",
            "Your furniture is checked and prepared for delivery.",
            "It is delivered, and you can rate your purchase here.",
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="size-7 shrink-0 rounded-full bg-[#1a2f1a] text-white text-xs font-black flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm font-bold text-[#1a2f1a]/70 pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/orders"
          className="flex-1 py-4 bg-[#1a2f1a] text-white text-center rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-black transition-colors"
        >
          Track my order
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 py-4 border-2 border-slate-100 text-[#1a2f1a] text-center rounded-full font-black uppercase tracking-widest text-[12px] hover:border-[#1a2f1a] transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
        {label}
      </p>
      <p className="text-base font-black text-[#1a2f1a]">{value}</p>
    </div>
  );
}

/** A value the shopper needs to type into another app, with a one-tap copy. */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the number is still on screen to read out.
    }
  };

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <p className="flex-1 text-xl font-black text-[#1a2f1a] tracking-wide break-all">
          {value}
        </p>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="shrink-0 h-11 px-4 rounded-full bg-white text-[#1a2f1a] hover:bg-[#1a2f1a] hover:text-white transition-colors flex items-center gap-1.5 shadow-sm text-[11px] font-black uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
