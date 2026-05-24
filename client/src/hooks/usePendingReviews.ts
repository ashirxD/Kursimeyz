import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

export interface PendingReviewProduct {
  productId: string;
  name: string;
  image: string;
  quantity: number;
}

export interface PendingReviewOrder {
  orderId: string;
  orderShortId: string;
  products: PendingReviewProduct[];
}

export const usePendingReviews = (enabled = true) => {
  const queryClient = useQueryClient();

  const pendingQuery = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: async () => {
      const response = await api.get('/reviews/pending');
      return (response.data.data || []) as PendingReviewOrder[];
    },
    enabled,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  const submitReviewsMutation = useMutation({
    mutationFn: async ({
      orderId,
      reviews,
    }: {
      orderId: string;
      reviews: Array<{ productId: string; rating: number; comment?: string }>;
    }) => {
      const response = await api.post('/reviews', { orderId, reviews });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async ({ orderId, hours = 24 }: { orderId: string; hours?: number }) => {
      const response = await api.post(`/reviews/snooze/${orderId}`, { hours });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/reviews/skip/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
    },
  });

  return {
    pendingOrders: pendingQuery.data || [],
    isLoading: pendingQuery.isLoading,
    refetch: pendingQuery.refetch,
    submitReviews: submitReviewsMutation.mutateAsync,
    isSubmitting: submitReviewsMutation.isPending,
    snoozeOrder: snoozeMutation.mutateAsync,
    isSnoozing: snoozeMutation.isPending,
    skipOrder: skipMutation.mutateAsync,
    isSkipping: skipMutation.isPending,
  };
};
