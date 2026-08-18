import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

export interface Category {
    _id: string;
    /** ProductType slug this category belongs to. */
    productType: string;
    name: string;
    slug: string;
    /** How many products currently sit in this category. */
    productCount: number;
}

export const CATEGORIES_QUERY_KEY = ['categories'];

/**
 * Categories saved for one product type — chair "Slim" and sofa "Slim" are
 * separate rows, so the list is always scoped.
 *
 * Note that categories are normally created as a side effect of saving a
 * product with a new category name; `createCategory` is only for adding one up
 * front. Product mutations invalidate this query (see useProducts).
 */
export const useCategories = (productType?: string) => {
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading, error } = useQuery<Category[]>({
        queryKey: [...CATEGORIES_QUERY_KEY, productType],
        queryFn: async () => {
            const response = await api.get('/categories', {
                params: productType ? { productType } : {},
            });
            return response.data;
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: async ({ name, productType: type }: { name: string; productType: string }) => {
            const response = await api.post('/categories', { name, productType: type });
            return response.data as Category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        },
    });

    const renameCategoryMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const response = await api.put(`/categories/${id}`, { name });
            return response.data as Category;
        },
        onSuccess: () => {
            // Renaming rewrites the category on every product that used it.
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
        },
    });

    return {
        categories,
        isLoading,
        error,
        createCategory: createCategoryMutation.mutateAsync,
        isCreating: createCategoryMutation.isPending,
        renameCategory: renameCategoryMutation.mutateAsync,
        isRenaming: renameCategoryMutation.isPending,
        deleteCategory: deleteCategoryMutation.mutateAsync,
        isDeleting: deleteCategoryMutation.isPending,
    };
};
