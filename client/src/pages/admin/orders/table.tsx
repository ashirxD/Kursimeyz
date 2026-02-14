

export interface Order {
    id: string;
    customer: {
        name: string;
        email: string;
        avatar: string;
    };
    product: {
        name: string;
        category: string;
        image: string;
    };
    amount: number;
    status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
    date: string;
}

const statusStyles = {
    Delivered: {
        bg: "bg-status-delivered-bg",
        text: "text-status-delivered-text",
        dot: "bg-forest-moss"
    },
    'In Transit': {
        bg: "bg-status-transit-bg",
        text: "text-status-transit-text",
        dot: "bg-[#54b1a4]"
    },
    Processing: {
        bg: "bg-status-processing-bg",
        text: "text-status-processing-text",
        dot: "bg-clay"
    },
    Cancelled: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500"
    }
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-white/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-forest-moss/5">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Order ID</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Customer</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Product</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Amount</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Status</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Date</th>
                            <th className="px-8 py-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-moss/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="group hover:bg-oatmeal/30 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-forest-moss/80">#{order.id}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="size-10 rounded-full border-2 border-white bg-cover bg-center shadow-sm"
                                            style={{ backgroundImage: `url(${order.customer.avatar})` }}
                                        />
                                        <div>
                                            <p className="text-sm font-black text-forest-moss leading-none">{order.customer.name}</p>
                                            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-tighter">{order.customer.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl overflow-hidden bg-oatmeal border border-forest-moss/5">
                                            <img src={order.product.image} className="w-full h-full object-cover" alt={order.product.name} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-forest-moss leading-none">{order.product.name}</p>
                                            <p className="text-[10px] font-bold text-forest-moss-light/50 mt-1 uppercase tracking-widest">{order.product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-black text-forest-moss">${order.amount}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusStyles[order.status].bg} ${statusStyles[order.status].text}`}>
                                        <span className={`size-1.5 rounded-full ${statusStyles[order.status].dot} animate-pulse`}></span>
                                        <span className="text-[10px] font-black uppercase tracking-wider">{order.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-bold text-forest-moss-light/70">{order.date}</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss-light hover:bg-forest-moss hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined !text-xl">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
