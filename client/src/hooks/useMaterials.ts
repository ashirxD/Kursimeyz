import { useQuery } from '@tanstack/react-query';
import api from '@/utils/Axios';

export interface MaterialSuggestions {
    body: string[];
    fabric: string[];
}

export const MATERIALS_QUERY_KEY = ['materials'];

const EMPTY: MaterialSuggestions = { body: [], fabric: [] };

/**
 * Materials the admin has already used, offered as suggestions in the product
 * form. Read straight off the saved products server-side, so the list needs no
 * managing — using a material once is what puts it in the list.
 */
export const useMaterials = () => {
    const { data = EMPTY, isLoading } = useQuery<MaterialSuggestions>({
        queryKey: MATERIALS_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/products/materials');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    return { materials: data, isLoading };
};
