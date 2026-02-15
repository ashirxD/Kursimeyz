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
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#fdfcf8] font-sans text-[#101b0e] overflow-hidden">
            {/* Left Side: Image Section */}
            <div
                className="hidden md:flex w-full md:w-1/2 relative h-full bg-cover bg-center transition-all duration-700 hover:scale-[1.01]"
                style={{
                    backgroundImage: `url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000")`,
                }}
            >
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent"></div>

                <div className="relative z-10 flex flex-col justify-between h-full px-16 py-20 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#5ef037] rounded-xl flex items-center justify-center shadow-lg shadow-[#5ef037]/30">
                            <span className="material-symbols-outlined text-white font-bold text-2xl">grid_view</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Earthly Admin</h1>
                    </div>

                    {/* Content */}
                    <div className="max-w-md">
                        <div className="w-10 h-1 bg-[#5ef037] mb-6 rounded-full"></div>
                        <blockquote className="text-[36px] lg:text-[40px] font-black leading-[1.1] mb-5 tracking-tight">
                            Efficiency is doing better what is <span className="text-[#5ef037]">already</span> being done.
                        </blockquote>
                        <p className="text-white/70 text-base font-medium">Manage your sustainable empire with precision and style.</p>
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
                            <span className="material-symbols-outlined text-white font-bold text-xl">grid_view</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase text-[#1a2f1a]">Earthly Admin</h1>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-3xl lg:text-4xl font-black text-[#1a2f1a] tracking-tight leading-tight">
                            Admin Portal
                        </h1>
                        <p className="text-slate-500 text-sm lg:text-[15px] font-medium">
                            Enter your credentials to access the command center.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="flex flex-col gap-4 lg:gap-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest ml-1 opacity-60">Admin Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 lg:h-12 px-4 rounded-[18px] border border-slate-200 bg-white text-[#1a2f1a] text-sm lg:text-base font-bold placeholder:text-slate-300 focus:border-[#5ef037] focus:ring-4 focus:ring-[#5ef037]/10 transition-all duration-300 outline-none shadow-sm"
                                placeholder="admin@earthly.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label htmlFor="password" className="text-[#1a2f1a] text-[11px] font-black uppercase tracking-widest opacity-60">Security Key</label>
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
                            className="mt-2 w-full h-12 lg:h-13 bg-[#1a2f1a] hover:bg-black text-white font-black text-base lg:text-lg rounded-[18px] transition-all duration-500 shadow-xl shadow-[#1a2f1a]/20 hover:shadow-black/30 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                        >
                            Authorize Access
                            <span className="material-symbols-outlined font-black text-xl">lock</span>
                        </button>
                    </form>

                    <div className="text-center mt-1">
                        <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest">
                            Secure Encrypted Environment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;