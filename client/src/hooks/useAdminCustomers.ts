import { useQuery } from '@tanstack/react-query';
import api from '@/utils/Axios';

export interface AdminCustomer {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  image?: string;
  createdAt: string;
  role: string;
}

interface CustomersResponse {
  success: boolean;
  data: AdminCustomer[];
}

export const useAdminCustomers = (): {
  customers: AdminCustomer[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
} => {
  const customersQuery = useQuery<CustomersResponse>({
    queryKey: ['admin', 'customers'],
    queryFn: async () => {
      const response = await api.get('/user/admin/all');
      return response.data;
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  const customers: AdminCustomer[] = customersQuery.data?.data || [];

  return {
    customers,
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    error: customersQuery.error,
    refetch: () => {
      void customersQuery.refetch();
    },
  };
};
