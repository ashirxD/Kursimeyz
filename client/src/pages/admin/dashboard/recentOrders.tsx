const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800", 
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, string> = {
    Pending: "processing",
    Processing: "processing", 
    Shipped: "transit",
    Delivered: "delivered",
    Cancelled: "cancelled"
  };
  return statusMap[status] || status.toLowerCase();
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorForUser = (name: string) => {
  const colors = ['#7ab89a', '#d4824a', '#9a7ab8', '#4a7c4a', '#b87a7a', '#7ab8d4'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

interface RecentOrdersProps {
  stats?: any;
}

const RecentOrders = ({ stats }: RecentOrdersProps) => {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-4 md:p-8 border border-white/50 flex-1 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-forest-moss tracking-tight">
          Recent Orders
        </h3>
        <button className="text-clay font-extrabold text-[11px] flex items-center gap-1.5 hover:underline tracking-wide group">
          View all
          <span className="material-symbols-outlined text-base! group-hover:translate-x-1 transition-transform">
            arrow_right_alt
          </span>
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2 min-w-[600px]">
          <thead>
            <tr className="text-forest-moss-light/50 font-black text-[9px] uppercase tracking-[0.15em]">
              <th className="pb-3 pl-3">Order ID</th>
              <th className="pb-3 px-3">Customer</th>
              <th className="pb-3 px-3">Product</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.map((order: any) => (
              <tr key={order._id} className="group cursor-pointer">
                <td className="py-3 pl-3 font-black text-forest-moss text-[14px] md:text-[15px] group-hover:text-clay transition-colors">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-full flex items-center justify-center font-black text-white text-[10px] border border-white shadow-soft"
                      style={{ backgroundColor: getColorForUser(order.user?.username || 'User') }}
                    >
                      {getInitials(order.user?.username || 'User')}
                    </div>
                    <span className="font-bold text-forest-moss text-[14px] md:text-[15px]">
                      {order.user?.username || 'Unknown User'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 md:size-9 rounded-xl bg-oatmeal flex items-center justify-center text-forest-moss-light group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg!">
                        chair
                      </span>
                    </div>
                    <span className="font-bold text-forest-moss text-[14px] md:text-[15px]">
                      {order.items?.[0]?.product?.name || 'Unknown Product'}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest inline-block shadow-sm ${statusStyles[order.status as keyof typeof statusStyles]}`}
                  >
                    {getStatusDisplay(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
