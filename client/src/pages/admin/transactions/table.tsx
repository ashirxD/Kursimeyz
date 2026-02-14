
export interface Transaction {
    id: string;
    customer: {
        name: string;
        avatar: string;
    };
    amount: number;
    method: 'Credit Card' | 'PayPal' | 'Bank Transfer' | 'Apple Pay';
    status: 'Success' | 'Failed' | 'Pending';
    date: string;
    time: string;
}

const statusStyles = {
    Success: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        dot: "bg-emerald-500"
    },
    Failed: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500"
    },
    Pending: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500"
    }
};

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-soft overflow-hidden border border-white/50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-forest-moss/5">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Transaction ID</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Customer</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Method</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Amount</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Status</th>
                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">Date & Time</th>
                            <th className="px-8 py-6 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-moss/5">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-oatmeal/30 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-forest-moss/80 font-mono">#{tx.id}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="size-9 rounded-full border-2 border-white bg-cover bg-center shadow-sm"
                                            style={{ backgroundImage: `url(${tx.customer.avatar})` }}
                                        />
                                        <p className="text-sm font-black text-forest-moss leading-none">{tx.customer.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined !text-sm text-forest-moss/30">
                                            {tx.method === 'Credit Card' ? 'credit_card' :
                                                tx.method === 'PayPal' ? 'account_balance_wallet' :
                                                    tx.method === 'Bank Transfer' ? 'account_balance' : 'account_balance_wallet'}
                                        </span>
                                        <span className="text-sm font-bold text-forest-moss/70">{tx.method}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-sm font-black ${tx.status === 'Failed' ? 'text-red-400' : 'text-forest-moss'}`}>
                                        ${tx.amount.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusStyles[tx.status].bg} ${statusStyles[tx.status].text}`}>
                                        <span className={`size-1.5 rounded-full ${statusStyles[tx.status].dot}`}></span>
                                        <span className="text-[10px] font-black uppercase tracking-wider">{tx.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-forest-moss-light/70">{tx.date}</span>
                                        <span className="text-[9px] font-black text-forest-moss/30 uppercase tracking-tighter">{tx.time}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="text-forest-moss/20 hover:text-forest-moss transition-colors">
                                        <span className="material-symbols-outlined">more_vert</span>
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
