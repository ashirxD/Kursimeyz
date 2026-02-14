import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';
import type { Chair as Product } from '@/pages/admin/chairs/cards';

export interface ProductQueryOptions {
    category?: 'chair' | 'table' | 'sofa' | 'bed' | 'other';
}

const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = (options: ProductQueryOptions = {}) => {
    const queryClient = useQueryClient();
    const { category } = options;

    // Fetch products (optionally filtered by category)
    const { data: products = [], isLoading, error } = useQuery<Product[]>({
        queryKey: [...PRODUCTS_QUERY_KEY, category],
        queryFn: async () => {
            const response = await api.get('/products', {
                params: { category }
            });
            return response.data.map((item: any) => ({
                ...item,
                id: item._id || item.id
            }));
        },
    });

    // Add a new product
    const addProductMutation = useMutation({
        mutationFn: async (newProduct: Omit<Product, 'id'>) => {
            const response = await api.post('/products', newProduct);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        },
    });

    // Delete a product
    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        },
    });

    return {
        products,
        isLoading,
        error,
        addProduct: addProductMutation.mutateAsync,
        isAdding: addProductMutation.isPending,
        deleteProduct: deleteProductMutation.mutateAsync,
        isDeleting: deleteProductMutation.isPending,
    };
};
