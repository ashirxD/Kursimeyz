import Header from '@/components/admin-layout/Header';
import TransactionsTable, { type Transaction } from './table';

const staticTransactions: Transaction[] = [
    {
        id: 'TX-72819',
        customer: {
            name: "Alexander Reed",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
        },
        amount: 450.00,
        method: 'Credit Card',
        status: 'Success',
        date: 'Oct 24, 2023',
        time: '14:20 PM'
    },
    {
        id: 'TX-72820',
        customer: {
            name: "Sarah Jenkins",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
        },
        amount: 1100.00,
        method: 'PayPal',
        status: 'Success',
        date: 'Oct 25, 2023',
        time: '09:12 AM'
    },
    {
        id: 'TX-72821',
        customer: {
            name: "Michael Chen",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
        },
        amount: 850.00,
        method: 'Bank Transfer',
        status: 'Failed',
        date: 'Oct 26, 2023',
        time: '18:45 PM'
    },
    {
        id: 'TX-72822',
        customer: {
            name: "Emma Wilson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
        },
        amount: 220.00,
        method: 'Credit Card',
        status: 'Pending',
        date: 'Oct 27, 2023',
        time: '11:30 AM'
    },
    {
        id: 'TX-72823',
        customer: {
            name: "James Miller",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
        },
        amount: 380.00,
        method: 'Apple Pay',
        status: 'Success',
        date: 'Oct 28, 2023',
        time: '10:05 AM'
    }
];

export default function TransactionsPage() {
    return (
        <div className="flex-1 flex flex-col gap-4 px-2 pb-6">
            <Header />

            <div className="flex flex-col gap-6">
                {/* Page Title & Stats */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-forest-moss tracking-tight">Finances</h2>
                        <p className="text-forest-moss-light/70 font-bold text-sm">Review incoming payments and transaction health.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white px-6 py-4 rounded-3xl shadow-soft border border-white/50 flex flex-col items-start min-w-[160px]">
                            <span className="text-[10px] font-black text-forest-moss/40 uppercase tracking-widest mb-1">Revenue</span>
                            <span className="text-xl font-black text-forest-moss leading-none">$24,850.00</span>
                            <span className="text-[9px] font-black text-emerald-500 uppercase mt-2 tracking-tighter">+8.2% vs last month</span>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-3xl shadow-soft border border-white/50 flex flex-col items-start min-w-[160px]">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Failed</span>
                            <span className="text-xl font-black text-red-500 leading-none">$1,420.00</span>
                            <span className="text-[9px] font-black text-red-300 uppercase mt-2 tracking-tighter">5 transactions rejected</span>
                        </div>
                        <div className="hidden md:flex bg-forest-moss px-6 py-4 rounded-3xl shadow-soft flex-col items-start min-w-[160px]">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Pending</span>
                            <span className="text-xl font-black text-white leading-none">$3,105.00</span>
                            <span className="text-[9px] font-black text-white/30 uppercase mt-2 tracking-tighter">Processing 12 orders</span>
                        </div>
                    </div>
                </div>

                {/* Search & Tool Bar */}
                <div className="flex flex-col md:flex-row gap-4 px-2">
                    <div className="flex-1 relative group">
                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-forest-moss/30 group-focus-within:text-clay transition-colors">receipt_long</span>
                        <input
                            type="text"
                            placeholder="Search transaction ID, customer name..."
                            className="w-full bg-white pl-14 pr-6 py-4 rounded-full border border-forest-moss/5 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm placeholder:text-forest-moss/20 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-4 bg-white rounded-full border border-forest-moss/5 text-forest-moss font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-forest-moss hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined !text-xl">calendar_today</span>
                            This Month
                        </button>
                        <button className="px-6 py-4 bg-white rounded-full border border-forest-moss/5 text-forest-moss font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                            Failed Only
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-2">
                    <TransactionsTable transactions={staticTransactions} />
                </div>
            </div>
        </div>
    );
}
