import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  let errorMessage = "An unexpected error occurred.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen w-full bg-[#fdfcf8] flex items-center justify-center p-4 font-sans text-[#101b0e]">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff311b]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a2f1a]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated Error Icon */}
        <div className="mb-8 relative inline-block">
          <div className="size-24 bg-[#1a2f1a] rounded-[32px] flex items-center justify-center shadow-2xl shadow-[#1a2f1a]/20 relative z-10 animate-bounce duration-[2000ms]">
            <span className="material-symbols-outlined text-white text-5xl font-black">
              warning
            </span>
          </div>
          <div className="absolute -inset-4 bg-[#ff311b]/20 rounded-[40px] blur-xl animate-pulse"></div>
        </div>

        {/* Error Details */}
        <h1 className="text-[120px] font-black text-[#1a2f1a] leading-none tracking-tighter mb-4 opacity-10">
          {errorStatus}
        </h1>
        <h2 className="text-3xl font-black text-[#1a2f1a] mb-4 tracking-tight">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          {errorMessage}
          <br />
          Don't worry, our team of highly skilled digital gardeners is on the case.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="h-14 px-8 bg-[#1a2f1a] hover:bg-black text-white font-black rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 shadow-xl shadow-[#1a2f1a]/20 hover:-translate-y-1 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">home</span>
            Return Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="h-14 px-8 bg-white border-2 border-[#1a2f1a]/10 hover:border-[#1a2f1a] text-[#1a2f1a] font-black rounded-2xl transition-all duration-500 flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
            Secure Sustainable Environment
          </p>
        </div>
      </div>
    </div>
  );
}
