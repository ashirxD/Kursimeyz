import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AdminLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Admin Login submitted', { email, password });
        navigate('/admin/dashboard');
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-body text-[#101b0e] overflow-hidden">
            {/* Left Side: Image Section */}
            <div
                className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center"
                style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3")`,
                }}
            >
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 flex flex-col justify-between h-full px-12 py-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#4fe830]">grid_view</span>
                        <h1 className="text-2xl font-bold tracking-tight font-display">Earthly Admin</h1>
                    </div>

                    {/* Quote */}
                    <div className="max-w-lg mb-8">
                        <blockquote className="text-4xl font-bold leading-tight mb-4 font-display">
                            "Efficiency is doing better what is already being done."
                        </blockquote>
                        <p className="text-white/90 text-lg">Manage with clarity and control.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-[#fdfcf8] h-full overflow-y-auto">
                <div className="w-full max-w-[440px] flex flex-col gap-8">
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-2 mb-4 text-[#101b0e]">
                        <span className="material-symbols-outlined text-3xl text-[#4fe830]">grid_view</span>
                        <h1 className="text-2xl font-bold tracking-tight font-display">Earthly Admin</h1>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-[#101b0e] tracking-tight font-display">
                            Admin Login
                        </h1>
                        <p className="text-[#3bc723] text-lg">
                            Please enter your credentials to access the dashboard.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-[#101b0e] text-sm font-semibold ml-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-[#101b0e] placeholder:text-slate-400 focus:border-[#4fe830] focus:ring-2 focus:ring-[#4fe830]/20 transition-all duration-200 outline-none"
                                placeholder="admin@earthly.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-[#101b0e] text-sm font-semibold">Password</label>
                            </div>
                            <div className="relative w-full">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-white text-[#101b0e] placeholder:text-slate-400 focus:border-[#4fe830] focus:ring-2 focus:ring-[#4fe830]/20 transition-all duration-200 outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#101b0e] transition-colors cursor-pointer"
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
                            className="mt-2 w-full h-12 bg-[#2c4c2c] hover:bg-[#1a2f1a] text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;