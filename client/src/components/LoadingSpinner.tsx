const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6] dark:bg-[#152111]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#5fe633] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
        </div>
    </div>
);

export default LoadingSpinner;
