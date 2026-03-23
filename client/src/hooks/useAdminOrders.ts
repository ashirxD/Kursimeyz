import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

export const useAllOrders = () => {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'all-orders'],
    queryFn: async () => {
      const response = await api.get('/order/admin/all');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    orders: ordersQuery.data?.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
  };
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      console.log('Updating order status:', { orderId, status });
      const response = await api.put(`/order/admin/${orderId}/status`, { status });
      console.log('Status update response:', response.data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('Status update successful:', data, variables);
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Status update failed:', error);
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    isLoading: updateStatusMutation.isPending,
    error: updateStatusMutation.error,
  };
};
