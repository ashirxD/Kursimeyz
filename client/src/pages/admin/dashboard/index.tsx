import Header from "@/pages/admin/layout/Header";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import RecentOrders from "./recentOrders";

export default function Dashboard() {
  const { stats, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-moss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">Error loading dashboard data</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  
  return (
    <div className="flex-1 flex flex-col gap-4 px-0 md:px-2 pb-6">
      <Header />

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left/Middle Column */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Total Sales */}
            <div className="bg-white p-6 rounded-3xl shadow-soft relative overflow-hidden group hover:scale-[1.01] transition-transform border border-white/50">
              <div className="absolute -right-2 -bottom-2 text-forest-moss/5 group-hover:text-forest-moss/10 transition-colors pointer-events-none">
                <span className="material-symbols-outlined text-[100px]!">
                  chair_alt
                </span>
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-forest-moss-light font-bold uppercase tracking-widest text-[10px]">
                  Total Sales
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-forest-moss tracking-tighter">
                  {formatCurrency(stats?.totalSales || 0)}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-forest-moss-light font-black text-[10px] px-3 py-1 bg-sage-soft rounded-full flex items-center gap-1 shadow-inner">
                    +12%
                  </span>
                  <span className="text-forest-moss-light/50 text-[10px] font-bold uppercase tracking-wide">
                    from last month
                  </span>
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white p-6 rounded-3xl shadow-soft flex flex-col justify-between hover:scale-[1.01] transition-transform border border-white/50">
              <div className="space-y-0.5">
                <p className="text-forest-moss-light font-bold uppercase tracking-widest text-[10px]">
                  Active Orders
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-forest-moss tracking-tighter">
                  {stats?.activeOrders || 0}
                </h3>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-forest-moss-light/70 uppercase tracking-widest">
                    Progress
                  </span>
                  <span className="text-xs font-black text-forest-moss">
                    {stats?.totalOrders ? Math.round(((stats?.activeOrders || 0) / stats?.totalOrders) * 100) : 0}%
                  </span>
                </div>
                <div className="h-4 w-full bg-oatmeal rounded-full p-0.5 shadow-inner overflow-hidden">
                  <div
                    className="h-full bg-forest-moss-light rounded-full transition-all duration-1000"
                    style={{ width: `${stats?.totalOrders ? Math.round(((stats?.activeOrders || 0) / stats?.totalOrders) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* New Customers */}
            <div className="bg-white p-6 rounded-3xl shadow-soft flex flex-col justify-between hover:scale-[1.01] transition-transform border border-white/50">
              <div className="space-y-0.5">
                <p className="text-forest-moss-light font-bold uppercase tracking-widest text-[10px]">
                  Total Orders
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-forest-moss tracking-tighter">
                  {stats?.totalOrders || 0}
                </h3>
              </div>
              <div className="mt-4 flex items-end gap-1.5 h-12 pointer-events-none">
                {[4, 8, 6, 12, 7, 10].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${i === 5 ? "bg-forest-moss-light" : "bg-sage-soft"} transition-all duration-700`}
                    style={{ height: `${(h / 12) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <RecentOrders stats={stats} />
        </div>

        {/* Right Sidebar Column */}
        <aside className="w-full lg:w-[340px] flex flex-col gap-6">
          {/* Goal Card */}
          <div className="bg-sage-leaf text-white p-8 rounded-3xl flex flex-col gap-4 shadow-medium relative overflow-hidden group border border-white/5">
            <div className="absolute -right-2 -top-2 text-white/10 group-hover:rotate-12 transition-transform pointer-events-none">
              <span className="material-symbols-outlined text-[100px]!">
                star
              </span>
            </div>
            <h4 className="text-xl font-black leading-tight tracking-tight relative z-10 w-2/3">
              Maker Goal ⭐
            </h4>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-5xl md:text-6xl font-black tracking-tighter">
                75%
              </span>
              <span className="font-black pb-2 text-sm opacity-80 tracking-widest uppercase">
                reached
              </span>
            </div>
            <div className="h-4 w-full bg-black/10 rounded-full p-1 shadow-inner">
              <div
                className="h-full bg-white rounded-full shadow-soft transition-all duration-1000"
                style={{ width: "75%" }}
              />
            </div>
            <p className="text-sm font-bold opacity-90 italic leading-relaxed tracking-tight">
              "Keep carving, keep creating. You're almost there!"
            </p>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft flex flex-col gap-4 border border-white/50">
            <h4 className="text-lg font-black text-forest-moss tracking-tight">
              Stock Alerts
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { title: "Walnut Stool", sub: "Only 2 left", type: "warning" },
                {
                  title: "Oak Varnish",
                  sub: "Restocked today",
                  type: "success",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-transform hover:scale-[1.02] ${
                    item.type === "warning"
                      ? "bg-orange-50/50"
                      : "bg-green-50/50"
                  }`}
                >
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center ${
                      item.type === "warning"
                        ? "bg-orange-100 text-[#d27d53]"
                        : "bg-green-100 text-forest-moss"
                    }`}
                  >
                    <span className="material-symbols-outlined !text-2xl">
                      {item.type === "warning" ? "warning" : "inventory_2"}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-forest-moss text-[15px] tracking-tight">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-bold text-forest-moss-light/60 tracking-wide uppercase">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-soft flex-1 overflow-hidden border border-white/50 flex flex-col gap-6">
            <h4 className="text-lg font-black text-forest-moss tracking-tight">
              Quick Chat
            </h4>
            <div className="flex flex-col gap-6">
              {/* Message Incoming */}
              <div className="flex gap-3 items-start text-left">
                <div className="size-9 rounded-full bg-oatmeal border border-white shadow-soft shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100"
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 max-w-[85%]">
                  <p className="text-[9px] font-black text-forest-moss-light/50 tracking-widest uppercase ml-1">
                    MARCUS L.
                  </p>
                  <div className="bg-oatmeal/50 p-4 rounded-2xl rounded-tl-none border border-black/5 shadow-sm">
                    <p className="text-[13px] font-bold text-forest-moss leading-relaxed">
                      Is the Nordic chair available in blue?
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Outgoing */}
              <div className="flex gap-3 items-start flex-row-reverse text-right">
                <div className="size-9 rounded-full bg-forest-moss-light border border-white shadow-soft shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                    className="size-full rounded-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 max-w-[85%] flex flex-col items-end">
                  <p className="text-[9px] font-black text-forest-moss-light/50 tracking-widest uppercase mr-1">
                    YOU
                  </p>
                  <div className="bg-sage-soft p-4 rounded-2xl rounded-tr-none border border-black/5 shadow-sm">
                    <p className="text-[13px] font-bold text-forest-moss leading-relaxed">
                      I'll check for you!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
