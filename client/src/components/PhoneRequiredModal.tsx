import { useEffect, useState, type FormEvent } from "react";
import { useAuthStore, type User } from "@/stores/authStore";
import api from "@/utils/Axios";
import {
  normalizePakistaniMobile,
  PAKISTANI_MOBILE_HINT,
} from "@/utils/phone";

interface UpdatePhoneResponse {
  success: boolean;
  message: string;
  user?: User;
}

export default function PhoneRequiredModal() {
  const {
    isPhoneRequiredModalOpen,
    pendingCartPhoneAction,
    closePhoneRequiredModal,
    setUser,
    updateUserPhone,
    user,
  } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isPhoneRequiredModalOpen) {
      setPhone(user?.phone || "");
      setError(null);
      setIsSaving(false);
    }
  }, [isPhoneRequiredModalOpen, user?.phone]);

  if (!isPhoneRequiredModalOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedPhone = normalizePakistaniMobile(phone);

    if (!normalizedPhone) {
      setError(PAKISTANI_MOBILE_HINT);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await api.put<UpdatePhoneResponse>("/user/phone", {
        phone: normalizedPhone,
      });
      const retry = pendingCartPhoneAction?.retry;

      if (response.data.user) {
        setUser(response.data.user);
      } else {
        updateUserPhone(normalizedPhone);
      }

      closePhoneRequiredModal();
      retry?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save phone number");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-forest-moss/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[2rem] bg-oatmeal shadow-medium border border-white/60 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-forest-moss tracking-tight">
                Add Phone Number
              </h3>
              <p className="text-[11px] font-bold text-forest-moss/60 uppercase tracking-widest">
                Required before cart
              </p>
            </div>
            <button
              type="button"
              onClick={closePhoneRequiredModal}
              disabled={isSaving}
              className="size-10 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft disabled:opacity-60"
              aria-label="Close phone modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label
                className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4"
                htmlFor="profile-phone"
              >
                Pakistani Phone
              </label>
              <div className="relative flex items-center">
                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError(null);
                  }}
                  placeholder="+923001234567"
                  className="w-full bg-white pl-5 pr-12 py-3.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                  disabled={isSaving}
                  autoFocus
                />
                <span className="material-symbols-outlined absolute right-5 text-forest-moss/30 text-[18px] pointer-events-none">
                  phone
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save and Add Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
