import { useQuery } from '@tanstack/react-query';
import api from '@/utils/Axios';
import type { Product } from '@/hooks/useProduct';

/**
 * Deliberately nested under ['products'], so every product mutation in
 * useProducts already invalidates the shelf — marking a product from the admin
 * screen shows up on the storefront without a bespoke cache key to remember.
 */
export const TOP_PICKS_QUERY_KEY = ['products', 'top-picks'];

/** The products an admin marked as Top Picks, newest pick first. */
export const useTopPicks = () => {
    const { data = [], isLoading, error } = useQuery<Product[]>({
        queryKey: TOP_PICKS_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/products/top-picks');
            return response.data;
        },
    });

    return { topPicks: data, isTopPicksLoading: isLoading, topPicksError: error };
};
