import { Link, useSearchParams } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/login";

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
          <BrandLogo imageClassName="h-12 w-auto max-w-[220px]" />
          <div className="max-w-md">
            <div className="w-10 h-1 bg-[#ff311b] mb-6 rounded-full" />
            <h2 className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
              Reset your access in a few steps.
            </h2>
            <p className="text-white/70 text-base font-medium">
              We will send a one-time code to your email so you can set a new password.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#fdfcf8] h-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff311b]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[400px] flex flex-col gap-6 lg:gap-8 relative z-10 overflow-y-auto lg:overflow-visible max-h-full py-4 px-2 custom-scrollbar">
          <div className="flex md:hidden mb-2">
            <BrandLogo imageClassName="h-11 w-auto max-w-[190px]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl lg:text-4xl font-black text-[#1a2f1a] tracking-tight leading-tight">
              Forgot Password
            </h1>
            <p className="text-slate-500 text-sm lg:text-[15px] font-medium">
              Enter your email, verify the OTP, then choose a new password.
            </p>
          </div>

          <ForgotPasswordForm variant="page" returnTo={returnTo} />

          <p className="text-center text-[14px] lg:text-[15px] text-slate-400 font-semibold">
            Remember your password?{" "}
            <Link
              to={returnTo}
              className="text-[#ff311b] font-black hover:underline underline-offset-4"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
