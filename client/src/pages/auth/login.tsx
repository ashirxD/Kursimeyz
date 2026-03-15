import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import type { CredentialResponse } from "@react-oauth/google";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoggingIn, loginError, googleAuth, isGoogleAuthing, googleAuthError } = useAuth();
  
  const errorMessage = loginError
    ? (loginError as any).response?.data?.message || "Login failed"
    : googleAuthError
    ? (googleAuthError as any).response?.data?.message || "Google authentication failed"
    : null;

  // Handle Google login success
  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      googleAuth(credentialResponse);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    login({ email, password });
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-sans text-[#101b0e] overflow-hidden">
      {/* Left Side: Image Section */}
      <div
        className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center transition-all duration-700 hover:scale-[1.01]"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=2000")`,
        }}
      >
        {/* Overlay: Deep gradient for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between h-full px-16 py-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
              <span className="material-symbols-outlined text-white font-bold text-2xl">
                chair
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              Earthly
            </h1>
          </div>

          {/* Content */}
          <div className="max-w-md">
            <div className="w-10 h-1 bg-[#5ef037] mb-6 rounded-full"></div>
            <blockquote className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
              Design isn't just about how it looks, but how it{" "}
              <span className="text-[#5ef037]">feels</span>.
            </blockquote>
            <p className="text-white/70 text-base font-medium">
              Experience comfort in its purest, most sustainable form.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#fdfcf8] h-full relative">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5ef037]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[400px] flex flex-col gap-6 lg:gap-8 relative z-10 overflow-y-auto lg:overflow-visible max-h-full py-4 px-2 custom-scrollbar">
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center gap-3 mb-2">
            <div className="size-9 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
              <span className="material-symbols-outlined text-white font-bold text-xl">
                chair
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase text-[#1a2f1a]">
              Earthly
            </h1>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[14px] font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
              {errorMessage}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl lg:text-4xl font-black text-[#1a2f1a] tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm lg:text-[15px] font-medium">
              Please enter your details to access your account.
            </p>
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-4 lg:gap-5"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60"
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
                disabled={isLoggingIn}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  htmlFor="password"
                  className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest opacity-60"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-[#5ef037] hover:text-[#4ad12d] text-xs lg:text-sm font-black transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 lg:h-12 px-4 pr-14 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                  placeholder="••••••••"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a2f1a] transition-colors cursor-pointer"
                  disabled={isLoggingIn}
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
              disabled={isLoggingIn}
              className="mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] flex-shrink-0 disabled:opacity-50"
            >
              {isLoggingIn ? "Logging in..." : "Log In"}
              <span className="material-symbols-outlined font-black text-xl">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2 lg:py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
              Or continue with
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Google OAuth Login Button */}
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isGoogleAuthing}
          />

          {/* Footer */}
          <p className="text-center text-[14px] lg:text-[15px] text-slate-400 font-semibold mb-2 lg:mb-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#5ef037] font-black hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
