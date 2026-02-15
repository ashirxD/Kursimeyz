import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login submitted', { email, password });

        // Redirect to dashboard on success
        navigate('/dashboard');
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
                            <span className="material-symbols-outlined text-white font-bold text-2xl">chair</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Earthly</h1>
                    </div>

                    {/* Content */}
                    <div className="max-w-md">
                        <div className="w-10 h-1 bg-[#5ef037] mb-6 rounded-full"></div>
                        <blockquote className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
                            Design isn't just about how it looks, but how it <span className="text-[#5ef037]">feels</span>.
                        </blockquote>
                        <p className="text-white/70 text-base font-medium">Experience comfort in its purest, most sustainable form.</p>
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
                            <span className="material-symbols-outlined text-white font-bold text-xl">chair</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase text-[#1a2f1a]">Earthly</h1>
                    </div>

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
                    <form className="flex flex-col gap-4 lg:gap-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 lg:h-12 px-4 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest opacity-60">Password</label>
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 lg:h-12 px-4 pr-14 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#1a2f1a] transition-colors cursor-pointer"
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
                            className="mt-2 w-full h-12 lg:h-14 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] flex-shrink-0"
                        >
                            Log In
                            <span className="material-symbols-outlined font-black text-xl">arrow_forward</span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center py-2 lg:py-4">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink-0 mx-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Or continue with</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    {/* Social Login */}
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

                    {/* Footer */}
                    <p className="text-center text-[14px] lg:text-[15px] text-slate-400 font-semibold mb-2 lg:mb-4">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#5ef037] font-black hover:underline underline-offset-4">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
