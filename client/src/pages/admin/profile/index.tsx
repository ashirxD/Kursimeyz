import { useState, useEffect } from "react";
import Header from "@/pages/admin/layout/Header";
import { useAuthStore } from "@/stores/authStore";
import { useAdminProfile } from "@/hooks/useAdminProfile";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { updateProfile, isPending } = useAdminProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [message, setMessage] = useState({ type: "", text: "" });

  // Prepopulate email field
  useEffect(() => {
    if (user && user.email) {
      setNewEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setMessage({ type: "error", text: "Please enter your current password" });
      return;
    }

    if (!newEmail && !newPassword) {
      setMessage({ type: "error", text: "Please provide a new email or new password to update" });
      return;
    }

    try {
      setMessage({ type: "", text: "" });

      const payload: any = {
        currentPassword
      };

      if (newEmail && newEmail !== user?.email) {
        payload.newEmail = newEmail;
      }

      if (newPassword) {
        payload.newPassword = newPassword;
      }

      // If nothing to update, return early
      if (!payload.newEmail && !payload.newPassword) {
         setMessage({ type: "success", text: "No changes made." });
         return;
      }

      const response = await updateProfile(payload);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        // Clear passwords
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
        <Header />

        <div className="flex flex-col gap-6 px-4 md:px-2">
          {/* Page Title */}
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
              Profile
            </h2>
            <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
              Manage your personal admin credentials.
            </p>
          </div>

          {/* Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-clay/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-clay text-2xl!">
                    person
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-moss tracking-tight">
                    Update Credentials
                  </h3>
                  <p className="text-forest-moss-light/60 font-bold text-xs">
                    Change your login email or password
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-black text-forest-moss uppercase tracking-widest"
                  >
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-forest-moss/30">
                      lock
                    </span>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-oatmeal/30 pl-12 pr-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-forest-moss-light/50">
                    Required to make any changes to your profile.
                  </p>
                </div>

                <hr className="border-forest-moss/5" />

                {/* New Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="newEmail"
                    className="block text-xs font-black text-forest-moss uppercase tracking-widest"
                  >
                    New Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-forest-moss/30">
                      mail
                    </span>
                    <input
                      type="email"
                      id="newEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g., admin@example.com"
                      className="w-full bg-oatmeal/30 pl-12 pr-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-black text-forest-moss uppercase tracking-widest"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-forest-moss/30">
                      key
                    </span>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-oatmeal/30 pl-12 pr-4 py-3.5 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30"
                    />
                  </div>
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
                  disabled={isPending}
                  className="w-full bg-forest-moss text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg!">
                        save
                      </span>
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-forest-moss/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl! text-forest-moss">
                    security
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-forest-moss tracking-tight">
                    Security First
                  </h3>
                  <p className="text-forest-moss-light/60 font-bold text-xs">
                    Why we require your current password
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
                      Protecting Your Account
                    </h4>
                    <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                      Requiring your current password ensures that even if you
                      leave your device unattended, no one else can change your
                      credentials.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                    <span className="text-clay font-black text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-black text-forest-moss text-sm">
                      Secure Password Standard
                    </h4>
                    <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                      New passwords should be at least 6 characters long and
                      include a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-clay/10 flex items-center justify-center shrink-0">
                    <span className="text-clay font-black text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-black text-forest-moss text-sm">
                      Stay Logged In
                    </h4>
                    <p className="text-forest-moss-light/60 text-xs font-bold mt-0.5">
                      You will remain logged in after successfully changing your
                      email or password.
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
                      If you use a password manager, remember to update it with
                      your new credentials right away to avoid getting locked
                      out in the future.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
