import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';

const navItems = [
    { name: 'My Nest', icon: 'home', path: '/dashboard' },
    { name: 'Order History', icon: 'receipt_long', path: '/orders' },
    { name: 'Wishlist', icon: 'favorite', path: '/wishlist' },
    { name: 'Settings', icon: 'settings', path: '/settings' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-[280px] flex flex-col h-full bg-white p-8 border-r border-slate-100">
            {/* Logo */}
            <div className="mb-16 px-2">
                <BrandLogo imageClassName="h-14 w-auto max-w-[210px]" />
                <p className="text-[#a5b8a5] text-[10px] font-bold uppercase tracking-widest mt-2">
                    YOUR FURNITURE NEST
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 group ${isActive
                                ? 'bg-[#ff311b] text-[#1a2f1a] font-bold shadow-lg shadow-[#ff311b]/20'
                                : 'text-slate-400 hover:text-[#1a2f1a] hover:bg-slate-50'
                                }`}
                        >
                            <span className={`material-symbols-outlined !text-2xl ${isActive ? 'text-[#1a2f1a]' : 'text-slate-300 group-hover:text-[#ff311b]'}`}>
                                {item.icon}
                            </span>
                            <span className="text-[15px] font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Seedling Status Widget */}
            <div className="bg-[#f6f8f6] rounded-[32px] p-6 mt-auto border border-slate-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined !text-xl text-[#ff311b]">potted_plant</span>
                    </div>
                    <span className="text-[14px] font-bold text-[#1a2f1a] truncate">Seedling Status</span>
                </div>

                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-[#ff311b] w-[65%]" />
                </div>

                <p className="text-[11px] text-slate-400 font-medium italic leading-loose">
                    350 more points to plant your next oak tree!
                </p>
            </div>
        </aside>
    );
}
