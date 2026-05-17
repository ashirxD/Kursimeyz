import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';
import type { Chair as Product } from '@/pages/admin/chairs/cards';

export interface ProductQueryOptions {
    category?: 'chair' | 'table' | 'sofa' | 'bed' | 'other';
    minPrice?: number;
    maxPrice?: number;
}

const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = (options: ProductQueryOptions = {}) => {
    const queryClient = useQueryClient();
    const { category, minPrice, maxPrice } = options;

    // Fetch products (optionally filtered by category and price)
    const { data: products = [], isLoading, error } = useQuery<Product[]>({
        queryKey: [...PRODUCTS_QUERY_KEY, category, minPrice, maxPrice],
        queryFn: async () => {
            const response = await api.get('/products', {
                params: { category, minPrice, maxPrice }
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

    // Update a product
    const updateProductMutation = useMutation({
        mutationFn: async ({ id, ...updatedProduct }: Product) => {
            const response = await api.put(`/products/${id}`, updatedProduct);
            return response.data;
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
        updateProduct: updateProductMutation.mutateAsync,
        isUpdating: updateProductMutation.isPending,
        deleteProduct: deleteProductMutation.mutateAsync,
        isDeleting: deleteProductMutation.isPending,
    };
};
