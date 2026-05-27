import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "@/hooks/useAuth";

type Step = "email" | "otp" | "password";

interface ForgotPasswordFormProps {
  variant?: "page" | "modal";
  returnTo?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
};

export default function ForgotPasswordForm({
  variant = "page",
  returnTo = "/login",
  onSuccess,
  onBack,
}: ForgotPasswordFormProps) {
  const navigate = useNavigate();
  const {
    requestResetOtp,
    isRequestingOtp,
    verifyResetOtp,
    isVerifyingOtp,
    resetPassword,
    isResettingPassword,
  } = useForgotPassword();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPage = variant === "page";
  const inputClass = isPage
    ? "w-full h-11 lg:h-12 px-4 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10 transition-all duration-300 outline-none shadow-sm"
    : "w-full bg-white px-5 py-3.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm";
  const labelClass = isPage
    ? "text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
    : "text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4";
  const buttonClass = isPage
    ? "mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
    : "w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed";

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setError(null);
      setMessage(null);
      const data = await requestResetOtp(email);
      setMessage(data.message || "A reset code has been sent to your email.");
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send reset code"));
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setError(null);
      await verifyResetOtp({ email, otp });
      setMessage("OTP verified. Enter your new password below.");
      setStep("password");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired OTP"));
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError(null);
      await resetPassword({ email, password });
      setMessage("Password reset successfully.");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reset password"));
    }
  };

  const isLoading = isRequestingOtp || isVerifyingOtp || isResettingPassword;

  return (
    <div className={isPage ? "flex flex-col gap-4 lg:gap-5" : "space-y-4"}>
      {error && (
        <div
          className={
            isPage
              ? "bg-red-50 text-red-600 p-4 rounded-2xl text-[14px] font-bold border border-red-100"
              : "bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100"
          }
        >
          {error}
        </div>
      )}

      {message && !error && (
        <div
          className={
            isPage
              ? "bg-green-50 text-green-700 p-4 rounded-2xl text-[14px] font-bold border border-green-100"
              : "bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-bold border border-green-100"
          }
        >
          {message}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleRequestOtp} className={isPage ? "flex flex-col gap-4 lg:gap-5" : "space-y-4"}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-email" className={labelClass}>
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" disabled={isLoading || !email} className={buttonClass}>
            {isRequestingOtp ? "Sending..." : "Get OTP"}
          </button>
        </form>
      )}

      {(step === "otp" || step === "password") && (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            value={email}
            className={`${inputClass} opacity-70`}
            disabled
          />
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className={isPage ? "flex flex-col gap-4 lg:gap-5" : "space-y-4"}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-otp" className={labelClass}>
              Verification Code
            </label>
            <input
              id="forgot-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={
                isPage
                  ? `${inputClass} text-xl tracking-[0.45em] text-center`
                  : `${inputClass} tracking-[0.5em] text-center`
              }
              placeholder="000000"
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" disabled={isLoading || otp.length !== 6} className={buttonClass}>
            {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleResetPassword} className={isPage ? "flex flex-col gap-4 lg:gap-5" : "space-y-4"}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className={labelClass}>
              New Password
            </label>
            <div className="relative w-full">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={isPage ? `${inputClass} pr-14` : inputClass}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              {isPage && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a2f1a] transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className={labelClass}>
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className={buttonClass}>
            {isResettingPassword ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {(onBack || isPage) && (
        <button
          type="button"
          onClick={onBack || (() => navigate(returnTo))}
          className={
            isPage
              ? "text-[#1a2f1a] font-black hover:text-[#ff6b35] transition-colors text-center"
              : "text-xs font-bold text-forest-moss-light hover:text-forest-moss transition-colors text-center w-full"
          }
        >
          Back to login
        </button>
      )}
    </div>
  );
}
