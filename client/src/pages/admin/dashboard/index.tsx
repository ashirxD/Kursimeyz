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
    return 'Rs ' + new Intl.NumberFormat('en-US', {
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
      </div>
    </div>
  );
}
