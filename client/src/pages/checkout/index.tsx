import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import CitySelect from "@/components/CitySelect";
import { useCart } from "@/hooks/useCart";
import { useOrder, type OrderPayload } from "@/hooks/useOrder";
import { findShippingCity, useShippingCities } from "@/hooks/useShippingCities";
import api from "@/utils/Axios";
import { resolveImageUrl } from "@/utils/imageUrl";
import {
  getCoverImage,
  getEffectivePrice,
  hasDiscount,
} from "@/utils/productPricing";

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  images?: string[];
}

interface CartLineItem {
  product: CartProduct;
  quantity: number;
}

const getOrderErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      "Failed to place order. Please try again."
    );
  }

  return "Failed to place order. Please try again.";
};

type PaymentMethod = "Cash" | "Card" | "Easypaisa" | "JazzCash" | "Bank";
type WalletMethod = Extract<PaymentMethod, "Easypaisa" | "JazzCash">;

interface PaymentSettings {
  whatsappNumber: string;
  easypaisaAccountNumber: string;
  easypaisaRedirectUrl: string;
  jazzcashAccountNumber: string;
  jazzcashRedirectUrl: string;
  bankAccountNumber: string;
  bankName: string;
  bankAccountTitle: string;
}

const defaultPaymentSettings: PaymentSettings = {
  whatsappNumber: "+923211411478",
  easypaisaAccountNumber: "",
  easypaisaRedirectUrl: "https://easypaisa.onelink.me/cw4d/q9y8ba5v",
  jazzcashAccountNumber: "",
  jazzcashRedirectUrl:
    "https://www.jazzcash.com.pk/jazzcash-app-aur-bhi-behtar/",
  bankAccountNumber: "",
  bankName: "",
  bankAccountTitle: "",
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
  const { cities } = useShippingCities();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(
    defaultPaymentSettings,
  );
  const [selectedWalletForInstructions, setSelectedWalletForInstructions] =
    useState<WalletMethod | null>(null);
  const [pendingWalletRedirect, setPendingWalletRedirect] =
    useState<WalletMethod | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [localError, setLocalError] = useState("");

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

  const cartItems = (cart?.items ?? []) as CartLineItem[];

  const subtotal =
    cartItems.reduce(
      (acc, item) => acc + getEffectivePrice(item.product) * item.quantity,
      0,
    ) || 0;
  const listTotal =
    cartItems.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0,
    ) || 0;
  const savings = listTotal - subtotal;

  // The rate comes from the city the customer picked. One they typed themselves
  // has no rate yet, so nothing is charged for delivery and it is agreed over
  // WhatsApp instead. The server resolves this the same way when the order is
  // placed, so what is shown here is a quote, not the authority.
  const selectedCity = findShippingCity(cities, address.city);
  const isCustomCity = address.city.trim().length > 0 && !selectedCity;
  const shipping = selectedCity?.shippingPrice ?? 0;
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
    items: cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: getEffectivePrice(item.product),
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

    if (
      paymentMethod === "Easypaisa" ||
      paymentMethod === "JazzCash" ||
      paymentMethod === "Bank"
    ) {
      try {
        await createOrderAsync(orderPayload);
        setOrderCreated(true);
        if (paymentMethod === "Easypaisa" || paymentMethod === "JazzCash") {
          setPendingWalletRedirect(paymentMethod);
        } else {
          navigate("/order-success");
        }
      } catch (error: unknown) {
        setLocalError(getOrderErrorMessage(error));
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

  const hasCartItems = cartItems.length > 0;

  if (pendingWalletRedirect) {
    return (
      <WalletRedirectModal
        method={pendingWalletRedirect}
        accountNumber={getWalletAccountNumber(pendingWalletRedirect)}
        onRedirect={redirectToWallet}
        onLater={goToOrderSuccess}
      />
    );
  }

  if (!hasCartItems && !orderCreated) {
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
          className="text-[#ff6b35] font-black uppercase tracking-widest hover:underline"
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
                <CitySelect
                  label="City"
                  placeholder="e.g. Lahore"
                  value={address.city}
                  cities={cities}
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

              {isCustomCity && (
                <CustomCityNotice whatsappNumber={paymentSettings.whatsappNumber} />
              )}
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
                {/* <PaymentButton
                  selected={paymentMethod === "Card"}
                  icon="credit_card"
                  title="Credit / Debit Card"
                  subtitle="Instant Activation"
                  onClick={() => setPaymentMethod("Card")}
                /> */}
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
                {paymentSettings.bankAccountNumber && (
                  <BankPaymentButton
                    selected={paymentMethod === "Bank"}
                    bankName={paymentSettings.bankName}
                    bankAccountTitle={paymentSettings.bankAccountTitle}
                    accountNumber={paymentSettings.bankAccountNumber}
                    onClick={() => setPaymentMethod("Bank")}
                  />
                )}
              </div>

              {/* Card details panel — commented out with the Card button above
              {paymentMethod === "Card" && (
                <div className="mt-8 p-8 bg-[#1a2f1a] rounded-[2.5rem] text-white space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  ...
                </div>
              )} */}

              {(paymentMethod === "Easypaisa" ||
                paymentMethod === "JazzCash") && (
                <div className="mt-8 p-6 bg-[#f4f5f0] rounded-4xl border border-slate-100">
                  <p className="text-[10px] font-black text-[#1a2f1a]/40 uppercase tracking-widest mb-2">
                    Selected Wallet Account
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#ff6b35]">
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

              {paymentMethod === "Bank" && (
                <div className="mt-8 p-6 bg-[#f4f5f0] rounded-4xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-[#1a2f1a]/40 uppercase tracking-widest">
                    Bank Transfer Details
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#ff6b35] mt-0.5">
                      account_balance
                    </span>
                    <div className="space-y-1">
                      {paymentSettings.bankName && (
                        <p className="text-[10px] font-black text-[#1a2f1a]/40 uppercase tracking-widest">
                          {paymentSettings.bankName}
                        </p>
                      )}
                      <p className="text-xl font-black text-[#1a2f1a] tracking-wide">
                        {paymentSettings.bankAccountNumber}
                      </p>
                      {paymentSettings.bankAccountTitle && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-sm text-[#1a2f1a]/40">
                            badge
                          </span>
                          <p className="text-sm font-black text-[#1a2f1a]/60">
                            {paymentSettings.bankAccountTitle}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#1a2f1a]/50 leading-relaxed">
                    Please verify the account title before transferring, then
                    send your payment screenshot through the WhatsApp button.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="w-full lg:w-[420px]">
            <div className="bg-[#f4f5f0] rounded-5xl p-10 sticky top-28">
              <h2 className="text-2xl font-black text-[#1a2f1a] mb-8">
                Order Harmony
              </h2>

              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.product?._id}
                    className="flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-16 bg-white rounded-2xl flex items-center justify-center p-2">
                        <img
                          src={resolveImageUrl(getCoverImage(item.product))}
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
                    <div className="text-right shrink-0">
                      <p
                        className={`font-black text-sm ${
                          hasDiscount(item.product)
                            ? "text-[#ff6b35]"
                            : "text-[#1a2f1a]"
                        }`}
                      >
                        Rs. {getEffectivePrice(item.product) * item.quantity}
                      </p>
                      {hasDiscount(item.product) && (
                        <p className="text-[11px] font-bold text-[#1a2f1a]/40 line-through">
                          Rs. {item.product.price * item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-[#1a2f1a]/5 mb-10">
                <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-[#ff6b35] font-bold">
                    <span>Discount savings</span>
                    <span>- Rs. {savings}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#1a2f1a]/60 font-medium">
                  <span>Shipping</span>
                  {isCustomCity ? (
                    <span className="font-bold text-[#ff6b35]">
                      To be confirmed
                    </span>
                  ) : selectedCity ? (
                    <span>Rs. {shipping}</span>
                  ) : (
                    <span className="text-[#1a2f1a]/40">Enter your city</span>
                  )}
                </div>
                <div className="pt-4 flex justify-between text-2xl font-black text-[#1a2f1a]">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>

              {(localError || createError) && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                  {localError || getOrderErrorMessage(createError)}
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

    </>
  );
}

/**
 * Shown when the customer types a city the shop has no rate for. The order is
 * still accepted at no delivery charge; this is where they are told the rate
 * gets agreed separately, so the total they see is not mistaken for the final one.
 */
const CustomCityNotice = ({ whatsappNumber }: { whatsappNumber: string }) => {
  const digits = whatsappNumber.replace(/\D/g, "");

  return (
    <div className="mt-6 p-5 rounded-2xl bg-[#ff6b35]/5 border border-[#ff6b35]/20 flex gap-4">
      <span className="material-symbols-outlined text-[22px] text-[#ff6b35] shrink-0">
        local_shipping
      </span>
      <div className="space-y-2">
        <p className="text-[13px] font-bold text-[#1a2f1a]">
          Shipping rates may vary for this city
        </p>
        <p className="text-[12px] font-medium text-[#1a2f1a]/60 leading-relaxed">
          We don't have a fixed delivery rate here yet, so no shipping is added
          to your total. Place your order and we'll confirm the charge with you,
          or ask us first on WhatsApp.
        </p>
        {digits && (
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-widest text-[#ff6b35] hover:underline"
          >
            Chat on WhatsApp
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </a>
        )}
      </div>
    </div>
  );
};

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
      className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#ff6b35] transition-all outline-none font-bold text-[#1a2f1a]"
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
    className={`h-24 px-8 rounded-4xl border-2 flex items-center gap-4 transition-all ${
      selected
        ? "border-[#ff6b35] bg-[#ff6b35]/5"
        : "border-slate-100 hover:border-[#1a2f1a]/20"
    }`}
  >
    <span
      className={`material-symbols-outlined text-3xl ${
        selected ? "text-[#ff6b35]" : "text-[#1a2f1a]/20"
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
      className={`min-h-24 px-8 py-5 rounded-4xl border-2 flex items-center gap-4 transition-all text-left ${
        selected
          ? "border-[#ff6b35] bg-[#ff6b35]/5"
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

interface BankPaymentButtonProps {
  selected: boolean;
  bankName: string;
  bankAccountTitle: string;
  accountNumber: string;
  onClick: () => void;
}

const BankPaymentButton = ({
  selected,
  bankName,
  bankAccountTitle,
  accountNumber,
  onClick,
}: BankPaymentButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-24 px-8 py-5 rounded-4xl border-2 flex items-center gap-4 transition-all text-left ${
      selected
        ? "border-[#ff6b35] bg-[#ff6b35]/5"
        : "border-slate-100 hover:border-[#1a2f1a]/20"
    }`}
  >
    <span
      className={`material-symbols-outlined text-3xl ${
        selected ? "text-[#ff6b35]" : "text-[#1a2f1a]/20"
      }`}
    >
      account_balance
    </span>
    <div>
      <p className="font-black text-[#1a2f1a]">
        Bank Transfer{bankName ? ` — ${bankName}` : ""}
      </p>
      <p className="text-[10px] font-bold text-[#1a2f1a]/40 uppercase tracking-widest">
        Direct bank deposit
      </p>
      <p className="text-xs font-black text-[#1a2f1a]/60 mt-1">
        {accountNumber}
      </p>
      {bankAccountTitle && (
        <p className="text-[10px] font-bold text-[#1a2f1a]/40 mt-0.5">
          {bankAccountTitle}
        </p>
      )}
    </div>
  </button>
);

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
  <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm">
    <div className="relative bg-white w-full max-w-md rounded-4xl shadow-2xl p-7 border border-white">
      <div className="flex items-center gap-4 mb-5">
        <div className="size-12 rounded-2xl bg-[#ff6b35]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#ff6b35] text-3xl">
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
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-[#1a2f1a]/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl p-7 border border-white text-center">
        <div className="size-24 bg-[#ff6b35]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-[48px] text-[#ff6b35] font-black">
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

        <div className="bg-[#f4f5f0] rounded-3xl p-4 mb-7 text-left">
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
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] mt-2 min-h-4">
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
