import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-14 lg:h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="size-7 bg-[#5ef037] rounded-lg flex items-center justify-center shadow-lg shadow-[#5ef037]/20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white font-bold text-lg">chair</span>
                    </div>
                    <h1 className="text-base font-black text-[#1a2f1a] tracking-tight flex flex-col leading-none">
                        <span>Relaxing</span>
                        <span className="text-[#5ef037]">Chair Shop</span>
                    </h1>
                </Link>

                {/* Navigation links */}
                <nav className="hidden md:flex items-center gap-6">
                    {['Home', 'Shop', 'About', 'Contact'].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase()}`}
                            className="text-[13px] font-bold text-[#1a2f1a]/60 hover:text-[#1a2f1a] transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5ef037] transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="size-10 flex items-center justify-center text-[#1a2f1a] hover:bg-slate-50 rounded-full transition-all">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </button>

                    <button className="h-10 px-5 bg-[#1a2f1a] hover:bg-black text-white rounded-full flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10">
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        <span className="text-[12px] font-black uppercase tracking-widest">Cart (0)</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
