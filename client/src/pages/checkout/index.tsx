import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useOrder, type OrderPayload } from "@/hooks/useOrder";
import api from "@/utils/Axios";
import { resolveImageUrl } from "@/utils/imageUrl";

type PaymentMethod = "Cash" | "Card" | "Easypaisa" | "JazzCash";
type WalletMethod = Extract<PaymentMethod, "Easypaisa" | "JazzCash">;

interface PaymentSettings {
  whatsappNumber: string;
  easypaisaAccountNumber: string;
  easypaisaRedirectUrl: string;
  jazzcashAccountNumber: string;
  jazzcashRedirectUrl: string;
}

const defaultPaymentSettings: PaymentSettings = {
  whatsappNumber: "+923211411478",
  easypaisaAccountNumber: "",
  easypaisaRedirectUrl: "https://easypaisa.onelink.me/cw4d/q9y8ba5v",
  jazzcashAccountNumber: "",
  jazzcashRedirectUrl:
    "https://www.jazzcash.com.pk/jazzcash-app-aur-bhi-behtar/",
};

const walletConfig = {
  Easypaisa: {
    icon: "account_balance_wallet",
    color: "text-emerald-500",
    title: "Easypaisa",
    subtitle: "Manual wallet transfer",
  },
  JazzCash: {
    icon: "payments",
    color: "text-orange-500",
    title: "JazzCash",
    subtitle: "Manual wallet transfer",
  },
};

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createOrder, createOrderAsync, isCreating, createError } = useOrder();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(
    defaultPaymentSettings,
  );
  const [selectedWalletForInstructions, setSelectedWalletForInstructions] =
    useState<WalletMethod | null>(null);
  const [pendingWalletRedirect, setPendingWalletRedirect] =
    useState<WalletMethod | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [localError, setLocalError] = useState("");

  const [cardInfo] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/26",
    cvc: "123",
  });

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await api.get("/user/payment-settings");

        if (response.data.success) {
          setPaymentSettings({
            ...defaultPaymentSettings,
            ...response.data.data,
          });
        }
      } catch (error) {
        console.error("Failed to fetch payment settings:", error);
      }
    };

    fetchPaymentSettings();
  }, []);

  const subtotal =
    cart?.items?.reduce(
      (acc: number, item: any) =>
        acc + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0;
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const getWalletAccountNumber = (method: WalletMethod) =>
    method === "Easypaisa"
      ? paymentSettings.easypaisaAccountNumber
      : paymentSettings.jazzcashAccountNumber;

  const getWalletRedirectUrl = (method: WalletMethod) =>
    method === "Easypaisa"
      ? paymentSettings.easypaisaRedirectUrl
      : paymentSettings.jazzcashRedirectUrl;

  const handleWalletSelect = (method: WalletMethod) => {
    if (!getWalletAccountNumber(method)) {
      return;
    }

    setPaymentMethod(method);
    setSelectedWalletForInstructions(method);
  };

  const buildOrderPayload = (): OrderPayload => ({
    items: cart.items.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    shippingAddress: address,
    paymentMethod,
    itemsPrice: subtotal,
    shippingPrice: shipping,
    totalPrice: total,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const orderPayload = buildOrderPayload();

    if (paymentMethod === "Easypaisa" || paymentMethod === "JazzCash") {
      try {
        await createOrderAsync(orderPayload);
        setOrderCreated(true);
        setPendingWalletRedirect(paymentMethod);
      } catch (error: any) {
        setLocalError(
          error.response?.data?.message ||
            "Failed to place order. Please try again.",
        );
      }
      return;
    }

    createOrder(orderPayload);
  };

  const redirectToWallet = () => {
    if (!pendingWalletRedirect) {
      return;
    }

    window.location.href = getWalletRedirectUrl(pendingWalletRedirect);
  };

  const goToOrderSuccess = () => {
    setPendingWalletRedirect(null);
    navigate("/order-success");
  };

  const hasCartItems = Boolean(cart?.items?.length);

  if (!hasCartItems && !pendingWalletRedirect && !orderCreated) {
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
    <>
      <div className="pt-24 pb-16 px-6 md:px-10 max-w-[1440px] mx-auto">
        <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-12">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-16"
        >
          <div className="flex-1 space-y-12">
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
                <CheckoutInput
                  label="Street Address"
                  type="text"
                  placeholder="e.g. 123 Peace Street"
                  value={address.street}
                  onChange={(value) =>
                    setAddress({ ...address, street: value })
                  }
                />
                <CheckoutInput
                  label="City"
                  type="text"
                  placeholder="e.g. Lahore"
                  value={address.city}
                  onChange={(value) => setAddress({ ...address, city: value })}
                />
                <CheckoutInput
                  label="Zip Code"
                  type="text"
                  placeholder="54000"
                  value={address.zipCode}
                  onChange={(value) =>
                    setAddress({ ...address, zipCode: value })
                  }
                />
                <CheckoutInput
                  label="Phone Number"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={address.phone}
                  onChange={(value) =>
                    setAddress({ ...address, phone: value })
                  }
                />
              </div>
            </section>

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
                <PaymentButton
                  selected={paymentMethod === "Card"}
                  icon="credit_card"
                  title="Credit / Debit Card"
                  subtitle="Instant Activation"
                  onClick={() => setPaymentMethod("Card")}
                />
                <PaymentButton
                  selected={paymentMethod === "Cash"}
                  icon="payments"
                  title="Cash on Delivery"
                  subtitle="Pay upon arrival"
                  onClick={() => setPaymentMethod("Cash")}
                />
                <WalletPaymentButton
                  method="Easypaisa"
                  selected={paymentMethod === "Easypaisa"}
                  accountNumber={paymentSettings.easypaisaAccountNumber}
                  onClick={() => handleWalletSelect("Easypaisa")}
                />
                <WalletPaymentButton
                  method="JazzCash"
                  selected={paymentMethod === "JazzCash"}
                  accountNumber={paymentSettings.jazzcashAccountNumber}
                  onClick={() => handleWalletSelect("JazzCash")}
                />
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

              {(paymentMethod === "Easypaisa" ||
                paymentMethod === "JazzCash") && (
                <div className="mt-8 p-6 bg-[#f4f5f0] rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-[#1a2f1a]/40 uppercase tracking-widest mb-2">
                    Selected Wallet Account
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#5ef037]">
                      account_balance_wallet
                    </span>
                    <span className="text-xl font-black text-[#1a2f1a] tracking-wide">
                      {getWalletAccountNumber(paymentMethod)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-[#1a2f1a]/50 leading-relaxed">
                    Please transfer the order total to this account and send the
                    payment screenshot through the WhatsApp button.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="w-full lg:w-[420px]">
            <div className="bg-[#f4f5f0] rounded-[2.5rem] p-10 sticky top-28">
              <h2 className="text-2xl font-black text-[#1a2f1a] mb-8">
                Order Harmony
              </h2>

              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart?.items?.map((item: any) => (
                  <div
                    key={item.product?._id}
                    className="flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-16 bg-white rounded-2xl flex items-center justify-center p-2">
                        <img
                          src={resolveImageUrl(item.product?.image)}
                          className="w-full h-full object-contain"
                          alt={item.product?.name}
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
                      Rs. {item.product?.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-[#1a2f1a]/5 mb-10">
                <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                  <span>Shipping</span>
                  <span>Rs. {shipping}</span>
                </div>
                <div className="pt-4 flex justify-between text-2xl font-black text-[#1a2f1a]">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>

              {(localError || createError) && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                  {localError ||
                    (createError as any)?.response?.data?.message ||
                    "Failed to place order. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-5 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Place Order</span>
                    <span className="material-symbols-outlined">bolt</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] font-bold text-[#1a2f1a]/30 uppercase tracking-widest mt-6">
                Secure Checkout - Satisfaction Guaranteed
              </p>
            </div>
          </div>
        </form>
      </div>

      {selectedWalletForInstructions && (
        <WalletInstructionsModal
          method={selectedWalletForInstructions}
          accountNumber={getWalletAccountNumber(selectedWalletForInstructions)}
          whatsappNumber={paymentSettings.whatsappNumber}
          onClose={() => setSelectedWalletForInstructions(null)}
        />
      )}

      {pendingWalletRedirect && (
        <WalletRedirectModal
          method={pendingWalletRedirect}
          accountNumber={getWalletAccountNumber(pendingWalletRedirect)}
          onRedirect={redirectToWallet}
          onLater={goToOrderSuccess}
        />
      )}
    </>
  );
}

interface CheckoutInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const CheckoutInput = ({
  label,
  type,
  placeholder,
  value,
  onChange,
}: CheckoutInputProps) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1">
      {label}
    </label>
    <input
      required
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#5ef037] transition-all outline-none font-bold text-[#1a2f1a]"
    />
  </div>
);

interface PaymentButtonProps {
  selected: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const PaymentButton = ({
  selected,
  icon,
  title,
  subtitle,
  onClick,
}: PaymentButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-24 px-8 rounded-[2rem] border-2 flex items-center gap-4 transition-all ${
      selected
        ? "border-[#5ef037] bg-[#5ef037]/5"
        : "border-slate-100 hover:border-[#1a2f1a]/20"
    }`}
  >
    <span
      className={`material-symbols-outlined text-3xl ${
        selected ? "text-[#5ef037]" : "text-[#1a2f1a]/20"
      }`}
    >
      {icon}
    </span>
    <div className="text-left">
      <p className="font-black text-[#1a2f1a]">{title}</p>
      <p className="text-[10px] font-bold text-[#1a2f1a]/40 uppercase tracking-widest">
        {subtitle}
      </p>
    </div>
  </button>
);

interface WalletPaymentButtonProps {
  method: WalletMethod;
  selected: boolean;
  accountNumber: string;
  onClick: () => void;
}

const WalletPaymentButton = ({
  method,
  selected,
  accountNumber,
  onClick,
}: WalletPaymentButtonProps) => {
  const config = walletConfig[method];
  const disabled = !accountNumber;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-24 px-8 py-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all text-left ${
        selected
          ? "border-[#5ef037] bg-[#5ef037]/5"
          : "border-slate-100 hover:border-[#1a2f1a]/20"
      } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-100`}
    >
      <span
        className={`material-symbols-outlined text-3xl ${
          selected ? config.color : "text-[#1a2f1a]/20"
        }`}
      >
        {config.icon}
      </span>
      <div>
        <p className="font-black text-[#1a2f1a]">{config.title}</p>
        <p className="text-[10px] font-bold text-[#1a2f1a]/40 uppercase tracking-widest">
          {disabled ? "Unavailable" : config.subtitle}
        </p>
        {accountNumber && (
          <p className="text-xs font-black text-[#1a2f1a]/60 mt-1">
            {accountNumber}
          </p>
        )}
      </div>
    </button>
  );
};

interface WalletInstructionsModalProps {
  method: WalletMethod;
  accountNumber: string;
  whatsappNumber: string;
  onClose: () => void;
}

const WalletInstructionsModal = ({
  method,
  accountNumber,
  whatsappNumber,
  onClose,
}: WalletInstructionsModalProps) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm">
    <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-7 border border-white">
      <div className="flex items-center gap-4 mb-5">
        <div className="size-12 rounded-2xl bg-[#5ef037]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#5ef037] text-3xl">
            account_balance_wallet
          </span>
        </div>
        <div>
          <h3 className="text-xl font-black text-[#1a2f1a]">
            Pay with {method}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40">
            Manual payment confirmation
          </p>
        </div>
      </div>

      <div className="bg-[#f4f5f0] rounded-2xl p-5 mb-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-2">
          Send payment to
        </p>
        <p className="text-2xl font-black text-[#1a2f1a] tracking-wide">
          {accountNumber}
        </p>
      </div>

      <p className="text-sm font-bold text-[#1a2f1a]/60 leading-relaxed mb-5">
        After making the payment, send your payment confirmation screenshot to
        WhatsApp number <span className="text-[#1a2f1a]">{whatsappNumber}</span>{" "}
        using the floating WhatsApp button.
      </p>

      <div className="mb-6 flex items-center justify-end gap-3 text-[#25D366]">
        <span className="text-xs font-black uppercase tracking-widest">
          WhatsApp button
        </span>
        <span className="material-symbols-outlined text-4xl rotate-45">
          arrow_downward
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-4 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-colors"
      >
        OK
      </button>
    </div>
  </div>
);

interface WalletRedirectModalProps {
  method: WalletMethod;
  accountNumber: string;
  onRedirect: () => void;
  onLater: () => void;
}

const WalletRedirectModal = ({
  method,
  accountNumber,
  onRedirect,
  onLater,
}: WalletRedirectModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = accountNumber;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy wallet account number:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-7 border border-white text-center">
        <div className="size-24 bg-[#5ef037]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-[48px] text-[#5ef037] font-black">
            check_circle
          </span>
        </div>

        <h3 className="text-[34px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-4">
          Order Confirmed
        </h3>

        <p className="text-sm font-bold text-[#1a2f1a]/60 leading-relaxed mb-5">
          Your order has been placed successfully. Send payment to the {method}
          number below, then send the payment screenshot on WhatsApp so the admin
          can confirm your order.
        </p>

        <div className="bg-[#f4f5f0] rounded-[1.5rem] p-4 mb-7 text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mb-2">
            {method} number
          </p>
          <div className="flex items-center gap-3">
            <p className="flex-1 text-xl font-black text-[#1a2f1a] tracking-wide break-all">
              {accountNumber}
            </p>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="shrink-0 size-11 rounded-full bg-white text-[#1a2f1a] hover:bg-[#1a2f1a] hover:text-white transition-colors flex items-center justify-center shadow-sm"
              aria-label={`Copy ${method} number`}
            >
              <span className="material-symbols-outlined text-xl">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#5ef037] mt-2 min-h-4">
            {copied ? "Copied" : ""}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onLater}
            className="flex-1 py-4 bg-slate-100 text-[#1a2f1a] rounded-full font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onRedirect}
            className="flex-[1.4] py-4 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
