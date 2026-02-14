import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
        { name: "Chairs", icon: "chair", path: "/admin/chairs" },
        { name: "Tables", icon: "table_bar", path: "/admin/tables" },
        { name: "Orders", icon: "shopping_basket", path: "/admin/orders" },
        { name: "Customers", icon: "group", path: "/admin/customers" },
        { name: "Settings", icon: "settings", path: "/admin/settings" },
    ];

    return (
        <aside className="w-64 bg-forest-moss text-white rounded-3xl flex flex-col justify-between p-6 h-[calc(100vh-2rem)] sticky top-4 ml-4 mb-4 overflow-hidden shrink-0 transition-all">
            <div className="flex flex-col gap-6">
                {/* Logo / Brand */}
                <div className="flex items-center gap-3 px-1">
                    <div className="size-10 bg-white/10 rounded-full flex items-center justify-center text-white border-2 border-white/20 shadow-inner shrink-0">
                        <span className="material-symbols-outlined !text-2xl font-bold">chair</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black leading-none tracking-tight">Kursimeyz</h1>
                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                            FOREST WORKSHOP
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all group ${isActive
                                    ? "bg-oatmeal text-forest-moss font-bold shadow-soft"
                                    : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
                                    }`}
                            >
                                <span className={`material-symbols-outlined !text-xl ${isActive ? "" : "text-white/50 group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[13px] tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom section */}
            <div className="mt-auto space-y-6">
                <button className="w-full bg-bark text-white py-3.5 rounded-full font-black text-[10px] flex items-center justify-center gap-2 hover:bg-bark-hover hover:scale-[1.02] active:scale-95 transition-all shadow-medium uppercase tracking-widest border border-white/5">
                    <span className="material-symbols-outlined !text-base">add_circle</span>
                    ADD NEW PRODUCT
                </button>

                <div className="flex items-center gap-2.5 px-1 pb-1">
                    {/* Avatar */}
                    <div
                        className="size-9 rounded-full border-2 border-white/20 bg-cover bg-center shadow-soft shrink-0"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')",
                        }}
                    ></div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate leading-tight">Maker Sophie</p>
                        <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider">
                            Shop Owner
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
