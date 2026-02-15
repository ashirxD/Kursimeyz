import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { register, isLoading, error } = useAuth();

    // Type guard or casting for error message
    const errorMessage = error ? (error as any).response?.data?.message || 'Registration failed' : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation in UI before sending
        if (!fullName || !email || !password) return;

        register({
            email,
            password,
            username: fullName, // Mapping fullName to username as requested
            fullName: fullName
        });
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
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent"></div>

                <div className="relative z-10 flex flex-col justify-between h-full px-16 py-20 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
                            <span className="material-symbols-outlined text-white font-bold text-2xl">chair</span>
                        </div>
                        <span className="text-3xl font-black tracking-tight uppercase">Earthly</span>
                    </div>

                    {/* Content */}
                    <div className="max-w-md">
                        <div className="w-10 h-1 bg-[#5ef037] mb-6 rounded-full"></div>
                        <h2 className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
                            Crafted from nature, designed for <span className="text-[#5ef037]">comfort</span>.
                        </h2>
                        <p className="text-white/70 text-base font-medium">
                            Join over 50,000 enthusiasts building a more sustainable and cozy future, one piece at a time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#fdfcf8] h-full relative">
                {/* Decorative background shapes */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#5ef037]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1a2f1a]/5 rounded-full translate-x-1/4 translate-y-1/4 blur-[100px] pointer-events-none" />

                <div className="w-full max-w-[400px] z-10 flex flex-col gap-4 lg:gap-6 relative overflow-y-auto lg:overflow-visible max-h-full py-4 px-2 custom-scrollbar">
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-3 mb-2">
                        <div className="size-9 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
                            <span className="material-symbols-outlined text-white font-bold text-xl">chair</span>
                        </div>
                        <span className="text-xl font-black tracking-tight uppercase text-[#1a2f1a]">Earthly</span>
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
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[14px] font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                            {errorMessage}
                        </div>
                    )}

                    {/* Form Fields */}
                    <form className="flex flex-col gap-3 lg:gap-4" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60" htmlFor="name">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-11 lg:h-12 px-4 pr-12 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                    placeholder="e.g. Oliver Tree"
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none !text-xl">
                                    person
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 lg:h-12 px-4 pr-12 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none !text-xl">
                                    mail
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 lg:h-12 px-4 pr-14 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                    placeholder="Min. 8 characters"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a2f1a] transition-colors cursor-pointer"
                                    disabled={isLoading}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 flex-shrink-0"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Get Started</span>
                                    <span className="material-symbols-outlined font-black">bolt</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center py-2 lg:py-4">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink-0 mx-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Or use social</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        className="w-full h-13 lg:h-14 bg-white border border-slate-100 hover:border-[#5ef037] hover:bg-slate-50 text-[#1a2f1a] font-black rounded-[18px] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm flex-shrink-0"
                    >
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="text-center mt-0.5">
                        <p className="text-slate-400 font-semibold text-[14px]">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-[#5ef037] font-black hover:underline underline-offset-4"
                            >
                                Log In
                            </Link>
                        </p>
                    </div>

                    {/* Terms Footer */}
                    <div className="text-center">
                        <p className="text-[11px] text-slate-300 font-bold max-w-[300px] mx-auto leading-relaxed mt-1">
                            By signing up, you agree to our <a href="#" className="text-slate-400 hover:text-[#5ef037]">Terms</a> and <a href="#" className="text-slate-400 hover:text-[#5ef037]">Privacy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
