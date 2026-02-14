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
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-body text-[#101b0e] overflow-hidden">
            {/* Left Side: Visual Hero */}
            <div
                className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center"
                style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAupkvt7CEm5Wxmfm88hHllK5HKtbfSB5QUtH5FXhthzukOgrbxfZmFmRRApr2bqqLcyyiRqtl-x0fSAymdEJ7j2LZNA4XZEU4rIZ9ibnTBo3qYshNOx8bRsvB5EXmT_BYD-QS-EJW8uvFlmG5XeZ4EowwtSKgk_YQV9fC-vaHENWwzuYCaLd6bnJUbLgvjkre_0eAKRZ263GpPNgLBAV7IPnDknePdpE_CqLTIJcyMotxzEh90U8gDOVFK_8kTusXFjJm1bxUKWd8')`,
                }}
            >
                {/* Dark Overlay for text legibility */}
                <div className="absolute inset-0 bg-black/20 z-0"></div>

                <div className="relative z-10 flex flex-col justify-between h-full px-12 py-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#4fe830]">chair</span>
                        <span className="text-2xl font-bold tracking-tight font-display">Earthly</span>
                    </div>

                    {/* Quote/Text */}
                    <div className="max-w-lg mb-8">
                        <h2 className="text-4xl font-bold leading-tight mb-4 font-display">
                            Crafted from nature, designed for comfort.
                        </h2>
                        <p className="text-white/90 text-lg">
                            Join our community of over 50,000 sustainable living enthusiasts.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-[#fdfcf8] h-full overflow-y-auto relative">
                {/* Joyful Background Shapes (kept subtle) */}
                <div
                    className="absolute w-64 h-64 bg-[#4fe830]/10 top-[-50px] right-[-50px] rounded-full z-0 pointer-events-none"
                    style={{ filter: 'blur(80px)' }}
                ></div>
                <div
                    className="absolute w-96 h-96 bg-[#9caf88]/10 bottom-[-100px] left-[-100px] rounded-full z-0 pointer-events-none"
                    style={{ filter: 'blur(80px)' }}
                ></div>

                <div className="w-full max-w-[440px] z-10 flex flex-col gap-6">
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-2 mb-4 text-[#101b0e]">
                        <span className="material-symbols-outlined text-3xl text-[#4fe830]">chair</span>
                        <span className="text-xl font-bold font-display">Earthly</span>
                    </div>

                    {/* Header */}
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#101b0e] mb-2 tracking-tight font-display">
                            Join the Comfort Club
                        </h1>
                        <p className="text-slate-500 text-base">
                            Discover the joy of sustainable seating today.
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-2 border border-red-200">
                            {errorMessage}
                        </div>
                    )}

                    {/* Google Button */}
                    <button
                        type="button"
                        className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-[#101b0e] font-semibold rounded-full transition-colors flex items-center justify-center gap-3 cursor-pointer"
                    >
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuJx-LOxh25GRsfLn49ulldOa6LYWe8nYCYD9yedj4nR6uq5XEzOLa70if_RLn93kr0DvJgI41XmnC8OSFEOIkPY0I9OyihEIqylPjO-GouWGFoGL6-Aum7Ptpd5mV9e53ESkU5ovEhV7TSUtzRqA0GRomCA2BT-yX4XNtPOl2HV1o5-1pRiDukCHO3Ose9QWEJD_tS5nnmdmbQvkwDHwbJBltAgzEeS8P76T0LfiAbz2Ys1TXcUDy3naw0KLd5z_9ngrplwk_R1g"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">
                            Or sign up with email
                        </span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Form Fields */}
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#101b0e] ml-1" htmlFor="name">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl h-12 px-4 outline-none focus:ring-2 focus:ring-[#4fe830]/20 focus:border-[#4fe830] transition-all text-[#101b0e] placeholder:text-slate-400 disabled:opacity-50"
                                    placeholder="e.g. Oliver Tree"
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-3 text-slate-400 text-[20px]">
                                    person
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#101b0e] ml-1" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl h-12 px-4 outline-none focus:ring-2 focus:ring-[#4fe830]/20 focus:border-[#4fe830] transition-all text-[#101b0e] placeholder:text-slate-400 disabled:opacity-50"
                                    placeholder="name@example.com"
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-3 text-slate-400 text-[20px]">
                                    mail
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#101b0e] ml-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl h-12 px-4 outline-none focus:ring-2 focus:ring-[#4fe830]/20 focus:border-[#4fe830] transition-all text-[#101b0e] placeholder:text-slate-400 disabled:opacity-50"
                                    placeholder="Min. 8 characters"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-slate-400 hover:text-[#101b0e] cursor-pointer"
                                    disabled={isLoading}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-4 w-full bg-[#3bc723] hover:brightness-110 text-white font-bold rounded-full h-12 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="text-center mt-2">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-[#e07a5f] hover:text-orange-700 font-bold transition-colors"
                            >
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms Footer */}
                <div className="absolute bottom-6 w-full text-center px-6">
                    <p className="text-xs text-slate-400">
                        By signing up, you agree to our{' '}
                        <a href="#" className="underline hover:text-slate-600">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="underline hover:text-slate-600">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
