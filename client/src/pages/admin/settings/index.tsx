import { useEffect, useState, type FormEvent } from "react";
import Header from "@/pages/admin/layout/Header";
import api from "@/utils/Axios";

const DEFAULT_EASYPAISA_REDIRECT_URL =
  "https://easypaisa.onelink.me/cw4d/q9y8ba5v";
const DEFAULT_JAZZCASH_REDIRECT_URL =
  "https://www.jazzcash.com.pk/jazzcash-app-aur-bhi-behtar/";

interface PaymentSettings {
  whatsappNumber: string;
  easypaisaAccountNumber: string;
  easypaisaRedirectUrl: string;
  jazzcashAccountNumber: string;
  jazzcashRedirectUrl: string;
}

const emptySettings: PaymentSettings = {
  whatsappNumber: "",
  easypaisaAccountNumber: "",
  easypaisaRedirectUrl: DEFAULT_EASYPAISA_REDIRECT_URL,
  jazzcashAccountNumber: "",
  jazzcashRedirectUrl: DEFAULT_JAZZCASH_REDIRECT_URL,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(emptySettings);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get("/user/admin/payment-settings");

      if (response.data.success) {
        setSettings({
          ...emptySettings,
          ...response.data.data,
        });
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load payment settings. Please try again.",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const updateField = (field: keyof PaymentSettings, value: string) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const cleanNumber = (value: string) => value.replace(/\D/g, "");

  const validateOptionalNumber = (value: string, label: string) => {
    const cleaned = cleanNumber(value);

    if (!cleaned) {
      return "";
    }

    if (cleaned.length < 10) {
      throw new Error(`${label} must have at least 10 digits`);
    }

    if (cleaned.length > 15) {
      throw new Error(`${label} must not exceed 15 digits`);
    }

    return cleaned;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        whatsappNumber: validateOptionalNumber(
          settings.whatsappNumber,
          "WhatsApp number",
        ),
        easypaisaAccountNumber: validateOptionalNumber(
          settings.easypaisaAccountNumber,
          "Easypaisa account number",
        ),
        easypaisaRedirectUrl:
          settings.easypaisaRedirectUrl.trim() || DEFAULT_EASYPAISA_REDIRECT_URL,
        jazzcashAccountNumber: validateOptionalNumber(
          settings.jazzcashAccountNumber,
          "JazzCash account number",
        ),
        jazzcashRedirectUrl:
          settings.jazzcashRedirectUrl.trim() || DEFAULT_JAZZCASH_REDIRECT_URL,
      };

      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await api.put("/user/admin/payment-settings", payload);

      if (response.data.success) {
        setSettings({
          ...emptySettings,
          ...response.data.data,
        });
        setMessage({
          type: "success",
          text: "Payment settings updated successfully!",
        });
      }
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update payment settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
        <Header />

        <div className="flex flex-col gap-6 px-4 md:px-2">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
              Settings
            </h2>
            <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
              Manage WhatsApp contact and wallet payment details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] gap-6">
            <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-green-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl! text-green-600">
                    account_balance_wallet
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-moss tracking-tight">
                    Payment & Contact Settings
                  </h3>
                  <p className="text-forest-moss-light/60 font-bold text-xs">
                    Configure WhatsApp, Easypaisa, and JazzCash details
                  </p>
                </div>
              </div>

              {fetchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-moss" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <SettingsInput
                    id="whatsappNumber"
                    icon="phone"
                    label="WhatsApp Number"
                    value={settings.whatsappNumber}
                    placeholder="+92 321 1411478"
                    helper="Include country code without + or 00. Customers send payment screenshots here."
                    onChange={(value) => updateField("whatsappNumber", value)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SettingsInput
                      id="easypaisaAccountNumber"
                      icon="send_to_mobile"
                      label="Easypaisa Account Number"
                      value={settings.easypaisaAccountNumber}
                      placeholder="03XXXXXXXXX"
                      helper="Shown to customers during Easypaisa checkout."
                      onChange={(value) =>
                        updateField("easypaisaAccountNumber", value)
                      }
                    />
                    <SettingsInput
                      id="easypaisaRedirectUrl"
                      icon="open_in_new"
                      label="Easypaisa Redirect URL"
                      value={settings.easypaisaRedirectUrl}
                      placeholder={DEFAULT_EASYPAISA_REDIRECT_URL}
                      helper="Where customers go after placing an Easypaisa order."
                      onChange={(value) =>
                        updateField("easypaisaRedirectUrl", value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SettingsInput
                      id="jazzcashAccountNumber"
                      icon="send_to_mobile"
                      label="JazzCash Account Number"
                      value={settings.jazzcashAccountNumber}
                      placeholder="03XXXXXXXXX"
                      helper="Shown to customers during JazzCash checkout."
                      onChange={(value) =>
                        updateField("jazzcashAccountNumber", value)
                      }
                    />
                    <SettingsInput
                      id="jazzcashRedirectUrl"
                      icon="open_in_new"
                      label="JazzCash Redirect URL"
                      value={settings.jazzcashRedirectUrl}
                      placeholder={DEFAULT_JAZZCASH_REDIRECT_URL}
                      helper="Where customers go after placing a JazzCash order."
                      onChange={(value) =>
                        updateField("jazzcashRedirectUrl", value)
                      }
                    />
                  </div>

                  {message.text && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {message.type === "success" ? "check_circle" : "error"}
                      </span>
                      <span className="text-sm font-bold">{message.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest-moss text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg!">
                          save
                        </span>
                        Save Payment Settings
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-forest-moss/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl! text-forest-moss">
                    info
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-moss tracking-tight">
                    Manual Payment Flow
                  </h3>
                  <p className="text-forest-moss-light/60 font-bold text-xs">
                    How customers complete wallet orders
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Customer selects Easypaisa or JazzCash at checkout.",
                  "They see your wallet number and a reminder to send the screenshot on WhatsApp.",
                  "After placing the order, they can open the selected wallet app/page.",
                  "You confirm the payment from the admin Orders page after reviewing proof.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                      <span className="text-clay font-black text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-forest-moss-light/70 text-xs font-bold leading-relaxed pt-1">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-oatmeal/50 rounded-xl border border-forest-moss/5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-forest-moss/50">
                    lightbulb
                  </span>
                  <p className="text-forest-moss-light/60 text-xs font-bold leading-relaxed">
                    If you leave a wallet account number empty, that payment
                    option will be disabled for customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SettingsInputProps {
  id: string;
  icon: string;
  label: string;
  value: string;
  placeholder: string;
  helper: string;
  onChange: (value: string) => void;
}

const SettingsInput = ({
  id,
  icon,
  label,
  value,
  placeholder,
  helper,
  onChange,
}: SettingsInputProps) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block text-xs font-black text-forest-moss uppercase tracking-widest"
    >
      {label}
    </label>
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-forest-moss/30">
        {icon}
      </span>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-oatmeal/30 pl-12 pr-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
      />
    </div>
    <p className="text-[10px] font-bold text-forest-moss-light/50">
      {helper}
    </p>
  </div>
);
