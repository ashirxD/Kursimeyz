import { useState, useEffect } from "react";
import Header from "@/pages/admin/layout/Header";
import api from "@/utils/Axios";

export default function SettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch current WhatsApp number on mount
  useEffect(() => {
    fetchWhatsAppNumber();
  }, []);

  const fetchWhatsAppNumber = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get("/user/admin/whatsapp");
      if (response.data.success) {
        setWhatsappNumber(response.data.whatsappNumber || "");
      }
    } catch (error) {
      console.error("Error fetching WhatsApp number:", error);
      setMessage({
        type: "error",
        text: "Failed to load WhatsApp number. Please try again.",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      setMessage({ type: "error", text: "Please enter a WhatsApp number" });
      return;
    }

    // Basic validation - remove non-digits and check length
    const cleanedNumber = whatsappNumber.replace(/\D/g, "");
    if (cleanedNumber.length < 10) {
      setMessage({
        type: "error",
        text: "Please enter a valid WhatsApp number with at least 10 digits",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await api.put("/user/whatsapp", {
        whatsappNumber: cleanedNumber,
      });

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "WhatsApp number updated successfully!",
        });
        setWhatsappNumber(response.data.whatsappNumber);
      }
    } catch (error: any) {
      console.error("Error updating WhatsApp number:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update WhatsApp number. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6 px-4 md:px-2">
        {/* Page Title */}
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
            Settings
          </h2>
          <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
            Manage your shop configuration and preferences.
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WhatsApp Settings Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="#25D366"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.029c0 2.125.553 4.197 1.597 6.06L0 24l6.102-1.6c1.805.984 3.834 1.496 5.86 1.496h.005c6.636 0 12.032-5.391 12.035-12.028a11.88 11.88 0 00-3.535-8.498" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-forest-moss tracking-tight">
                  WhatsApp Integration
                </h3>
                <p className="text-forest-moss-light/60 font-bold text-xs">
                  Configure your business WhatsApp number
                </p>
              </div>
            </div>

            {fetchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-moss"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* WhatsApp Number Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsappNumber"
                    className="block text-xs font-black text-forest-moss uppercase tracking-widest"
                  >
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-forest-moss/30">
                      phone
                    </span>
                    <input
                      type="text"
                      id="whatsappNumber"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g., 923024379999"
                      className="w-full bg-oatmeal/30 pl-12 pr-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-forest-moss-light/50">
                    Include country code (e.g., 92 for Pakistan). This number
                    will be used for the floating WhatsApp chat button on your
                    website.
                  </p>
                </div>

                {/* Message Display */}
                {message.text && (
                  <div
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {message.type === "success"
                        ? "check_circle"
                        : "error"}
                    </span>
                    <span className="text-sm font-bold">{message.text}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-forest-moss text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-lg">
                        save
                      </span>
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-forest-moss/5 flex items-center justify-center">
                <span className="material-symbols-outlined !text-2xl text-forest-moss">
                  info
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-forest-moss tracking-tight">
                  How It Works
                </h3>
                <p className="text-forest-moss-light/60 font-bold text-xs">
                  Understanding the WhatsApp integration
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                  <span className="text-clay font-black text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-black text-forest-moss text-sm">
                    Set Your Number
                  </h4>
                  <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                    Enter your business WhatsApp number with country code in the
                    settings form.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                  <span className="text-clay font-black text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-black text-forest-moss text-sm">
                    Floating Button Appears
                  </h4>
                  <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                    A WhatsApp chat button will automatically appear on all
                    pages of your website.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                  <span className="text-clay font-black text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-black text-forest-moss text-sm">
                    Customers Connect
                  </h4>
                  <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                    Visitors can click the button to start a WhatsApp
                    conversation with your business.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-oatmeal/50 rounded-xl border border-forest-moss/5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-forest-moss/50">
                  lightbulb
                </span>
                <div>
                  <h5 className="font-black text-forest-moss text-xs uppercase tracking-wider">
                    Pro Tip
                  </h5>
                  <p className="text-forest-moss-light/60 text-xs font-bold mt-1">
                    Make sure your WhatsApp Business account is set up and
                    active. The number should include the country code without
                    any + or 00 prefix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
