import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

export const useAllOrders = (search?: string) => {
  const ordersQuery = useQuery({
    queryKey: ['admin', 'all-orders', search],
    queryFn: async () => {
      const response = await api.get('/order/admin/all', {
        params: search ? { search } : {},
      });
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

export interface PaymentConfirmationData {
  _id: string;
  transactionReference?: string;
  paymentDate?: string;
  receiptUrl?: string;
  confirmedAt?: string;
  confirmedBy?: { username: string };
}

export interface AdminOrderDetail {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    _id: string;
    product: {
      _id: string;
      name: string;
      image: string;
      category?: string;
      price?: number;
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: string;
  paymentConfirmation?: PaymentConfirmationData;
  paymentResult?: {
    id?: string;
    status?: string;
    receipt?: string;
    paymentDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useAdminOrderDetail = (orderId: string | undefined) => {
  const orderQuery = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      const response = await api.get(`/order/admin/${orderId}`);
      return response.data.data as AdminOrderDetail;
    },
    enabled: !!orderId,
  });

  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
    refetch: orderQuery.refetch,
  };
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: { paymentId?: string; receiptUrl?: string; paymentDate?: string };
    }) => {
      const response = await api.put(`/order/admin/${orderId}/pay`, payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', variables.orderId] });
    },
  });

  return {
    confirmPayment: confirmPaymentMutation.mutateAsync,
    isPending: confirmPaymentMutation.isPending,
    error: confirmPaymentMutation.error,
  };
};

