import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';
import { CATEGORIES_QUERY_KEY } from '@/hooks/useCategories';
import { MATERIALS_QUERY_KEY } from '@/hooks/useMaterials';
import type { Product } from '@/types/product';

export interface ProductQueryOptions {
    /** ProductType slug, e.g. "chair". */
    category?: string;
    /** Category slug within that product type, e.g. "slim". */
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    /** Set false when a caller only needs the mutations, to skip the fetch. */
    enabled?: boolean;
}

const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = (options: ProductQueryOptions = {}) => {
    const queryClient = useQueryClient();
    const { category, subCategory, minPrice, maxPrice, enabled = true } = options;

    // Saving a product can mint a new category and a new material, so all three
    // caches go stale together. The Top Picks shelf is cached under this same
    // ['products'] prefix, so it is refetched by the same call.
    const invalidateProducts = () => {
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: MATERIALS_QUERY_KEY });
    };

    // Fetch products (optionally filtered by category and price)
    const { data: products = [], isLoading, error } = useQuery<Product[]>({
        queryKey: [...PRODUCTS_QUERY_KEY, category, subCategory, minPrice, maxPrice],
        queryFn: async () => {
            const params: ProductQueryOptions = {};
            if (category !== undefined) params.category = category;
            if (subCategory !== undefined) params.subCategory = subCategory;
            if (minPrice !== undefined) params.minPrice = minPrice;
            if (maxPrice !== undefined) params.maxPrice = maxPrice;

            const response = await api.get('/products', {
                params
            });
            return response.data.map((item: any) => ({
                ...item,
                id: item._id || item.id
            }));
        },
        placeholderData: keepPreviousData,
        enabled,
    });

    // Add a new product
    const addProductMutation = useMutation({
        mutationFn: async (newProduct: Omit<Product, 'id'>) => {
            const response = await api.post('/products', newProduct);
            return response.data;
        },
        onSuccess: invalidateProducts,
    });

    // Delete a product
    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
            return id;
        },
        onSuccess: invalidateProducts,
    });

    // Mark or unmark a Top Pick. Its own tiny endpoint rather than a full
    // product update, so the star on a card cannot disturb any other field.
    const setTopPickMutation = useMutation({
        mutationFn: async ({ id, isTopPick }: { id: string; isTopPick: boolean }) => {
            const response = await api.patch(`/products/${id}/top-pick`, { isTopPick });
            return response.data;
        },
        onSuccess: invalidateProducts,
    });

    // Update a product
    const updateProductMutation = useMutation({
        mutationFn: async ({ id, ...updatedProduct }: Product) => {
            const response = await api.put(`/products/${id}`, updatedProduct);
            return response.data;
        },
        onSuccess: invalidateProducts,
    });

    return {
        products,
        isLoading,
        error,
        addProduct: addProductMutation.mutateAsync,
        isAdding: addProductMutation.isPending,
        updateProduct: updateProductMutation.mutateAsync,
        isUpdating: updateProductMutation.isPending,
        setTopPick: setTopPickMutation.mutateAsync,
        isSettingTopPick: setTopPickMutation.isPending,
        deleteProduct: deleteProductMutation.mutateAsync,
        isDeleting: deleteProductMutation.isPending,
    };
};
