import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/utils/Axios";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/stores/toastStore";
import { getErrorMessage } from "@/utils/apiError";
import {
  normalizePakistaniMobile,
  PAKISTANI_MOBILE_HINT,
} from "@/utils/phone";
import {
  loadCheckoutPrefs,
  saveCheckoutPrefs,
} from "@/utils/checkoutPrefs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const fieldLabel =
  "text-[10px] font-black uppercase tracking-widest text-[#1a2f1a]/40 ml-1";
const fieldInput =
  "w-full h-14 px-6 rounded-2xl border border-slate-100 bg-[#f4f5f0]/50 focus:bg-white focus:border-[#ff311b] transition-all outline-none font-bold text-[#1a2f1a]";

/**
 * Where a shopper manages their own details. Until now the only account action
 * anywhere was signing out: a wrong phone number could not be fixed, and the
 * delivery address had to be retyped on every order.
 */
export default function AccountPage() {
  useDocumentTitle("My account");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const updateUserPhone = useAuthStore((state) => state.updateUserPhone);
  const logout = useAuthStore((state) => state.logout);

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [address, setAddress] = useState(loadCheckoutPrefs);

  const handleSavePhone = async (event: FormEvent) => {
    event.preventDefault();
    setPhoneError("");

    const normalized = normalizePakistaniMobile(phone);
    if (!normalized) {
      setPhoneError(PAKISTANI_MOBILE_HINT);
      return;
    }

    setIsSavingPhone(true);
    try {
      await api.put("/user/phone", { phone: normalized });
      updateUserPhone(normalized);
      setPhone(normalized);
      toast.success("Your phone number has been updated.");
    } catch (error) {
      setPhoneError(getErrorMessage(error, "We couldn't save your phone number."));
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleSaveAddress = (event: FormEvent) => {
    event.preventDefault();
    saveCheckoutPrefs(address);
    toast.success("Delivery details saved. Checkout will start from these.");
  };

  const handleClearAddress = () => {
    const empty = { street: "", city: "", zipCode: "", phone: "" };
    setAddress(empty);
    saveCheckoutPrefs(empty);
    toast.info("Saved delivery details removed from this device.");
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      queryClient.clear();
      navigate("/login");
    }
  };

  if (!user) return null;

  const initial = (user.username || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="pt-24 pb-16 px-6 md:px-10 max-w-[760px] mx-auto">
      <h1 className="text-[40px] lg:text-[52px] font-black text-[#1a2f1a] tracking-tight leading-[1.05] mb-10">
        My account
      </h1>

      {/* Identity */}
      <section className="flex items-center gap-5 p-6 bg-[#f4f5f0] rounded-4xl mb-8">
        {user.image ? (
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <div className="size-16 rounded-full bg-[#1a2f1a] text-white flex items-center justify-center text-2xl font-black">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xl font-black text-[#1a2f1a] truncate">{user.username}</p>
          <p className="text-sm font-bold text-[#1a2f1a]/50 truncate">{user.email}</p>
          {user.provider === "google" && (
            <p className="text-[11px] font-black uppercase tracking-widest text-[#1a2f1a]/40 mt-1">
              Signed in with Google
            </p>
          )}
        </div>
      </section>

      {/* Phone */}
      <form onSubmit={handleSavePhone} className="mb-12 space-y-3" noValidate>
        <h2 className="text-lg font-black text-[#1a2f1a]">Phone number</h2>
        <p className="text-sm font-medium text-[#1a2f1a]/50">
          We use this to confirm deliveries and agree shipping for cities outside
          our list.
        </p>
        <div className="space-y-2">
          <label htmlFor="account-phone" className={fieldLabel}>
            Mobile number
          </label>
          <input
            id="account-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+92 300 1234567"
            aria-invalid={Boolean(phoneError)}
            className={fieldInput}
          />
          {phoneError && (
            <p role="alert" className="text-sm font-bold text-red-600 ml-1">
              {phoneError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSavingPhone}
          className="px-8 py-3.5 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSavingPhone ? "Saving..." : "Save phone"}
        </button>
      </form>

      {/* Delivery details */}
      <form onSubmit={handleSaveAddress} className="mb-12 space-y-4">
        <h2 className="text-lg font-black text-[#1a2f1a]">Saved delivery details</h2>
        <p className="text-sm font-medium text-[#1a2f1a]/50">
          Stored on this device only, so checkout and the cart's delivery estimate
          start from them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="account-street" className={fieldLabel}>
              Street address
            </label>
            <input
              id="account-street"
              type="text"
              autoComplete="street-address"
              value={address.street}
              onChange={(event) => setAddress({ ...address, street: event.target.value })}
              className={fieldInput}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="account-city" className={fieldLabel}>
              City
            </label>
            <input
              id="account-city"
              type="text"
              autoComplete="address-level2"
              value={address.city}
              onChange={(event) => setAddress({ ...address, city: event.target.value })}
              className={fieldInput}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="account-zip" className={fieldLabel}>
              Postal code
            </label>
            <input
              id="account-zip"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              value={address.zipCode}
              onChange={(event) => setAddress({ ...address, zipCode: event.target.value })}
              className={fieldInput}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#1a2f1a] text-white rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-black transition-colors"
          >
            Save details
          </button>
          <button
            type="button"
            onClick={handleClearAddress}
            className="px-8 py-3.5 bg-slate-100 text-[#1a2f1a] rounded-full font-black uppercase tracking-widest text-[12px] hover:bg-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Shortcuts */}
      <section className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-slate-100">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-[#ff311b] font-black uppercase tracking-widest text-[12px] hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          View my orders
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[12px] hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign out
        </button>
      </section>
    </div>
  );
}
