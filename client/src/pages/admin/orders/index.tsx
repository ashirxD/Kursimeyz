import Header from "@/pages/admin/layout/Header";
import OrdersTable from "./table";
import { useAllOrders } from "@/hooks/useAdminOrders";

export default function OrdersPage() {
  const { orders, isLoading, error, refetch } = useAllOrders();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-moss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-bold">Error loading orders</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-forest-moss text-white rounded-xl font-black hover:bg-forest-moss-light transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      <div className="flex flex-col gap-6">
        {/* Page Title & Stats Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4 md:px-2">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-forest-moss tracking-tight">
              Orders Registry
            </h2>
            <p className="text-forest-moss-light/70 font-bold text-xs md:text-sm">
              Monitor and manage your workshop's commercial flow.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 lg:flex-none bg-white px-6 py-3 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center min-w-[100px] md:min-w-[120px]">
              <span className="text-[9px] md:text-[10px] font-black text-forest-moss/40 uppercase tracking-widest leading-none mb-1">
                Total
              </span>
              <span className="text-lg md:text-xl font-black text-forest-moss leading-none">
                {orders.length}
              </span>
            </div>
            <div className="flex-1 lg:flex-none bg-white px-6 py-3 rounded-3xl shadow-soft border border-white/50 flex flex-col items-center min-w-[100px] md:min-w-[120px]">
              <span className="text-[9px] md:text-[10px] font-black text-forest-moss/40 uppercase tracking-widest leading-none mb-1">
                Growth
              </span>
              <span className="text-lg md:text-xl font-black text-clay leading-none">
                +12.5%
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 px-4 md:px-2">
          <div className="flex-1 relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-forest-moss/30 group-focus-within:text-clay transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="w-full bg-white pl-14 pr-6 py-3 md:py-4 rounded-full border border-forest-moss/5 focus:outline-none focus:ring-2 focus:ring-clay/20 transition-all font-bold text-sm placeholder:text-forest-moss/20 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 md:flex-none px-6 py-3 md:py-4 bg-white rounded-full border border-forest-moss/5 text-forest-moss font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined text-xl!">
                filter_list
              </span>
              Filter
            </button>
            <button className="flex-1 md:flex-none px-6 py-3 md:py-4 bg-forest-moss text-white rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-forest-moss-light transition-all shadow-medium">
              <span className="material-symbols-outlined text-xl!">
                download
              </span>
              Export
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="px-4 md:px-2 overflow-x-auto custom-scrollbar">
          <OrdersTable orders={orders} />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs font-bold text-forest-moss-light/50 uppercase tracking-widest">
            Showing <span className="text-forest-moss font-black">5</span> of{" "}
            <span className="text-forest-moss font-black">1,284</span> entries
          </p>
          <div className="flex gap-2">
            <button className="size-10 rounded-full bg-white border border-forest-moss/5 flex items-center justify-center text-forest-moss hover:bg-forest-moss hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-1.5 px-2">
              {[1, 2, 3, "...", 12].map((n, i) => (
                <button
                  key={i}
                  className={`size-10 rounded-full font-black text-xs transition-all ${n === 1 ? "bg-clay text-white shadow-soft" : "bg-white text-forest-moss/40 hover:text-forest-moss shadow-sm border border-forest-moss/5"}`}
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
