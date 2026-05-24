import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@/utils/Axios";
import { useAuthStore } from "@/stores";

interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    image?: string;
    provider?: string;
    role?: string;
    emailVerified?: boolean;
  };
}

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const stateEmail =
    typeof location.state === "object" && location.state !== null
      ? (location.state as { email?: string }).email
      : undefined;
  const queryEmail = useMemo(
    () => new URLSearchParams(location.search).get("email") || "",
    [location.search],
  );

  const [email, setEmail] = useState(stateEmail || queryEmail);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState(
    stateEmail || queryEmail
      ? "We sent a 6-digit code to your email."
      : "Enter the email you used during signup.",
  );
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || otp.length !== 6) {
      setError("Please enter your email and the 6-digit OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      const response = await api.post<VerifyOtpResponse>("/auth/verify-otp", {
        email,
        otp,
      });

      storeLogin(response.data.user, response.data.token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email before requesting a new OTP.");
      return;
    }

    try {
      setIsResending(true);
      setError(null);
      await api.post("/auth/send-otp", { email });
      setMessage("A fresh OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-sans text-[#101b0e] overflow-hidden">
      <div
        className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/25 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full px-16 py-20 text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
              <span className="material-symbols-outlined text-white font-bold text-2xl">
                chair
              </span>
            </div>
            <span className="text-3xl font-black tracking-tight uppercase">
              Kursimeyz
            </span>
          </div>

          <div className="max-w-md">
            <div className="w-10 h-1 bg-[#5ef037] mb-6 rounded-full" />
            <h2 className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
              One quick check before you settle in.
            </h2>
            <p className="text-white/70 text-base font-medium">
              Confirm your email to unlock your account and continue to your
              dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#fdfcf8] h-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5ef037]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[400px] flex flex-col gap-6 relative z-10 px-2">
          <div className="flex md:hidden items-center gap-3 mb-2">
            <div className="size-9 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
              <span className="material-symbols-outlined text-white font-bold text-xl">
                chair
              </span>
            </div>
            <span className="text-xl font-black tracking-tight uppercase text-[#1a2f1a]">
              Kursimeyz
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl lg:text-4xl font-black text-[#1a2f1a] tracking-tight leading-tight">
              Verify Email
            </h1>
            <p className="text-slate-500 text-sm lg:text-[15px] font-medium">
              {message}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[14px] font-bold border border-red-100">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4 lg:gap-5" onSubmit={handleVerify}>
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 lg:h-12 px-4 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                placeholder="name@example.com"
                disabled={isVerifying}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="otp"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full h-12 lg:h-14 px-4 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-xl font-black tracking-[0.45em] placeholder:tracking-normal placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm text-center"
                placeholder="000000"
                disabled={isVerifying}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify and Continue"}
              <span className="material-symbols-outlined font-black text-xl">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="text-center flex flex-col gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isVerifying}
              className="text-[#1a2f1a] font-black hover:text-[#5ef037] transition-colors disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
            <p className="text-slate-400 font-semibold text-[14px]">
              Already verified?{" "}
              <Link
                to="/login"
                className="text-[#5ef037] font-black hover:underline underline-offset-4"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
