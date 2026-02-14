import Header from '@/components/admin-layout/Header';
import OrdersTable, { type Order } from './table';

const staticOrders: Order[] = [
    {
        id: '29384',
        customer: {
            name: "Alexander Reed",
            email: "alex.reed@email.com",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
        },
        product: {
            name: "Nordic Oak Chair",
            category: "Chair",
            image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500"
        },
        amount: 450,
        status: 'Delivered',
        date: 'Oct 24, 2023'
    },
    {
        id: '29385',
        customer: {
            name: "Sarah Jenkins",
            email: "sarah.j@email.com",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
        },
        product: {
            name: "Terracotta Lounge",
            category: "Chair",
            image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500"
        },
        amount: 1100,
        status: 'In Transit',
        date: 'Oct 25, 2023'
    },
    {
        id: '29386',
        customer: {
            name: "Michael Chen",
            email: "m.chen@email.com",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
        },
        product: {
            name: "Oak Dining Table",
            category: "Table",
            image: "https://images.unsplash.com/photo-1577146333355-630f775370c8?w=800"
        },
        amount: 850,
        status: 'Processing',
        date: 'Oct 26, 2023'
    },
    {
        id: '29387',
        customer: {
            name: "Emma Wilson",
            email: "emma.w@email.com",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
        },
        product: {
            name: "Minimalist Stool",
            category: "Chair",
            image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=500"
        },
        amount: 220,
        status: 'Cancelled',
        date: 'Oct 27, 2023'
    },
    {
        id: '29388',
        customer: {
            name: "James Miller",
            email: "j.miller@email.com",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
        },
        product: {
            name: "Rustic Bench",
            category: "Table",
            image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800"
        },
        amount: 380,
        status: 'Delivered',
        date: 'Oct 28, 2023'
    }
];

export default function OrdersPage() {
    return (
        <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
            <Header />

            <div className="flex flex-col gap-6">
                {/* Page Title & Stats Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-forest-moss tracking-tight">Orders Registry</h2>
                        <p className="text-forest-moss-light/70 font-bold text-sm">Monitor and manage your workshop's commercial flow.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-3 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black text-forest-moss/40 uppercase tracking-widest leading-none mb-1">Total</span>
                            <span className="text-xl font-black text-forest-moss leading-none">1,284</span>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black text-forest-moss/40 uppercase tracking-widest leading-none mb-1">Growth</span>
                            <span className="text-xl font-black text-clay leading-none">+12.5%</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 px-2">
                    <div className="flex-1 relative group">
                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-forest-moss/30 group-focus-within:text-clay transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Search orders, customers, or products..."
                            className="w-full bg-white pl-14 pr-6 py-4 rounded-full border border-forest-moss/5 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm placeholder:text-forest-moss/20 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-4 bg-white rounded-full border border-forest-moss/5 text-forest-moss font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-forest-moss hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined !text-xl">filter_list</span>
                            Filter
                        </button>
                        <button className="px-6 py-4 bg-forest-moss text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium">
                            <span className="material-symbols-outlined !text-xl">download</span>
                            Export
                        </button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="px-2">
                    <OrdersTable orders={staticOrders} />
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4">
                    <p className="text-xs font-bold text-forest-moss-light/50 uppercase tracking-widest">
                        Showing <span className="text-forest-moss font-black">5</span> of <span className="text-forest-moss font-black">1,284</span> entries
                    </p>
                    <div className="flex gap-2">
                        <button className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss hover:bg-forest-moss hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <div className="flex gap-1.5 px-2">
                            {[1, 2, 3, '...', 12].map((n, i) => (
                                <button
                                    key={i}
                                    className={`size-10 rounded-full font-black text-xs transition-all ${n === 1 ? 'bg-clay text-white shadow-soft' : 'bg-white text-forest-moss/40 hover:text-forest-moss shadow-sm border border-forest-moss/5'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss hover:bg-forest-moss hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
