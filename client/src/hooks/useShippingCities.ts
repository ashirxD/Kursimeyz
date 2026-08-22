import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';
import { slugify } from '@/utils/slug';

/** A city the shop delivers to at a rate the admin has set. */
export interface ShippingCity {
    _id: string;
    name: string;
    /** What a typed city name is matched against. */
    slug: string;
    shippingPrice: number;
}

export const SHIPPING_CITIES_QUERY_KEY = ['shipping-cities'];

export const useShippingCities = () => {
    const queryClient = useQueryClient();

    const { data: cities = [], isLoading, error } = useQuery<ShippingCity[]>({
        queryKey: SHIPPING_CITIES_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/shipping-cities');
            return response.data;
        },
        // Checkout reads this on every visit; rates change rarely.
        staleTime: 5 * 60 * 1000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: SHIPPING_CITIES_QUERY_KEY });
    };

    const createCityMutation = useMutation({
        mutationFn: async (input: { name: string; shippingPrice: number }) => {
            const response = await api.post('/shipping-cities', input);
            return response.data as ShippingCity;
        },
        onSuccess: invalidate,
    });

    const updateCityMutation = useMutation({
        mutationFn: async ({ id, ...input }: { id: string; name?: string; shippingPrice?: number }) => {
            const response = await api.put(`/shipping-cities/${id}`, input);
            return response.data as ShippingCity;
        },
        onSuccess: invalidate,
    });

    const deleteCityMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/shipping-cities/${id}`);
            return id;
        },
        onSuccess: invalidate,
    });

    return {
        cities,
        isLoading,
        error,
        createCity: createCityMutation.mutateAsync,
        isCreating: createCityMutation.isPending,
        updateCity: updateCityMutation.mutateAsync,
        isUpdating: updateCityMutation.isPending,
        deleteCity: deleteCityMutation.mutateAsync,
        isDeleting: deleteCityMutation.isPending,
    };
};

/**
 * The city a typed name refers to, or undefined when it is not one the shop has
 * a rate for. Matching is on the slug so casing and stray spaces do not matter —
 * the server resolves the charge the same way (server/utils/shipping.js).
 */
export const findShippingCity = (cities: ShippingCity[], cityName: string) => {
    const slug = slugify(cityName);
    if (!slug) return undefined;

    return cities.find((city) => city.slug === slug);
};
