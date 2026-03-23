import { useQuery } from '@tanstack/react-query';
import api from '@/utils/Axios';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalOrders: number;
  statusCounts: Record<string, number>;
  recentOrders: any[];
  monthlySales: { month: string; sales: number }[];
}

interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export const useAdminDashboard = () => {
  const dashboardQuery = useQuery<DashboardStatsResponse>({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/order/admin/dashboard-stats');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    stats: dashboardQuery.data?.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
};

export const useAllOrders = () => {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'all-orders'],
    queryFn: async () => {
      const response = await api.get('/order/admin/all');
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  return {
    orders: ordersQuery.data?.data,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
  };
};

export const useUpdateOrderStatus = () => {
  const updateStatus = async (orderId: string, status: string) => {
    const response = await api.put(`/order/admin/${orderId}/status`, { status });
    return response.data;
  };

  return { updateStatus };
};
