import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import BrandLogo from "@/components/BrandLogo";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import type { CredentialResponse } from "@react-oauth/google";
import {
  normalizePakistaniMobile,
  PAKISTANI_MOBILE_HINT,
} from "@/utils/phone";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    isRegistering,
    registerError,
    googleAuth,
    isGoogleAuthing,
    googleAuthError,
  } = useAuth();

  // Type guard or casting for error message
  const errorMessage = localError
    ? localError
    : registerError
    ? (registerError as any).response?.data?.message || "Registration failed"
    : googleAuthError
    ? (googleAuthError as any).response?.data?.message ||
      "Google authentication failed"
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLocalError(null);

    // Basic validation in UI before sending
    if (!phone) {
      setLocalError(PAKISTANI_MOBILE_HINT);
      return;
    }

    if (!fullName || !email || !password) return;

    const normalizedPhone = normalizePakistaniMobile(phone);

    if (!normalizedPhone) {
      setLocalError(PAKISTANI_MOBILE_HINT);
      return;
    }

    register({
      email,
      password,
      username: fullName, // Mapping fullName to username as requested
      fullName: fullName,
      phone: normalizedPhone,
    });
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      googleAuth(credentialResponse);
    }
  };

  const handleGoogleError = () => {
    console.error("Google signup failed");
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-sans text-[#101b0e] overflow-hidden">
      {/* Left Side: Visual Hero */}
      <div
        className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center transition-all duration-700 hover:scale-[1.01]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000')`,
        }}
      >
        {/* Deep Overlay for premium feel */}
        <div className="absolute inset-0 bg-linear-to-tr from-black/70 via-black/30 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between h-full px-16 py-20 text-white">
          {/* Logo */}
          <BrandLogo imageClassName="h-12 w-auto max-w-[220px]" />

          {/* Content */}
          <div className="max-w-md">
            <div className="w-10 h-1 bg-[#ff311b] mb-6 rounded-full"></div>
            <h2 className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
              Crafted from nature, designed for{" "}
              <span className="text-[#ff311b]">comfort</span>.
            </h2>
            <p className="text-white/70 text-base font-medium">
              Join over 50,000 enthusiasts building a more sustainable and cozy
              future, one piece at a time.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#fdfcf8] h-full relative">
        <Link
          to="/"
          className="absolute left-4 md:left-8 lg:left-12 top-4 md:top-8 z-30 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#4b3621] shadow-lg shadow-black/10 backdrop-blur transition-all hover:bg-[#4b3621] hover:text-white"
        >
          <span className="material-symbols-outlined !text-lg">arrow_back</span>
          Home
        </Link>

        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#ff311b]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1a2f1a]/5 rounded-full translate-x-1/4 translate-y-1/4 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[400px] z-10 flex flex-col gap-4 lg:gap-6 relative overflow-y-auto lg:overflow-visible max-h-full py-4 px-2 custom-scrollbar">
          {/* Mobile Logo */}
          <div className="flex md:hidden mb-2">
            <BrandLogo imageClassName="h-11 w-auto max-w-[190px]" />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl lg:text-4xl font-black text-[#1a2f1a] tracking-tight leading-tight">
              Create Account
            </h1>
            <p className="text-slate-500 text-sm lg:text-[15px] font-medium">
              Start your journey towards a more sustainable home.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[14px] font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <form
            className="flex flex-col gap-3 lg:gap-4"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 lg:h-12 px-4 pr-12 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#ff311b] focus:ring-4 focus:ring-[#ff311b]/10 transition-all duration-300 outline-none shadow-sm"
                  placeholder="e.g. Oliver Tree"
                  disabled={isRegistering || isGoogleAuthing}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xl!">
                  person
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError(null);
                  }}
                  className="w-full h-11 lg:h-12 px-4 pr-12 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#ff311b] focus:ring-4 focus:ring-[#ff311b]/10 transition-all duration-300 outline-none shadow-sm"
                  placeholder="name@example.com"
                  disabled={isRegistering || isGoogleAuthing}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xl!">
                  mail
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="phone"
              >
                Pakistani Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setLocalError(null);
                  }}
                  className="w-full h-11 lg:h-12 px-4 pr-12 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#ff311b] focus:ring-4 focus:ring-[#ff311b]/10 transition-all duration-300 outline-none shadow-sm"
                  placeholder="+923001234567"
                  disabled={isRegistering || isGoogleAuthing}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xl!">
                  phone
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 lg:h-12 px-4 pr-14 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#ff311b] focus:ring-4 focus:ring-[#ff311b]/10 transition-all duration-300 outline-none shadow-sm"
                  placeholder="Min. 8 characters"
                  disabled={isRegistering || isGoogleAuthing}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a2f1a] transition-colors cursor-pointer"
                  disabled={isRegistering || isGoogleAuthing}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 shrink-0"
              disabled={isRegistering || isGoogleAuthing}
            >
              {isRegistering ? (
                <div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Get Started</span>
                  <span className="material-symbols-outlined font-black">
                    bolt
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2 lg:py-4">
            <div className="grow border-t border-slate-100"></div>
            <span className="shrink-0 mx-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
              Or use social
            </span>
            <div className="grow border-t border-slate-100"></div>
          </div>

          {/* Google Button */}
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isRegistering || isGoogleAuthing}
          />

          <div className="text-center mt-0.5">
            <p className="text-slate-400 font-semibold text-[14px]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#ff311b] font-black hover:underline underline-offset-4"
              >
                Log In
              </Link>
            </p>
          </div>

          {/* Terms Footer */}
          <div className="text-center">
            <p className="text-[11px] text-slate-300 font-bold max-w-[300px] mx-auto leading-relaxed mt-1">
              By signing up, you agree to our{" "}
              <a href="#" className="text-slate-400 hover:text-[#ff311b]">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-slate-400 hover:text-[#ff311b]">
                Privacy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
