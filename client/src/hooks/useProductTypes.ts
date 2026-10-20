import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';
import type { CardAspect, ImageDisplay } from '@/utils/productImageDisplay';

/** Whether the shop banner reuses the dashboard card's photos or has its own. */
export type CoverMode = 'shared' | 'separate';

/**
 * A kind of furniture the shop sells. Admin-managed, so chairs/tables/sofas are
 * just seeded rows rather than anything special in the code.
 */
export interface ProductType {
    _id: string;
    /** Immutable identity — what Product.category stores. */
    slug: string;
    /** Immutable URL segment — /shop/<pluralSlug>. */
    pluralSlug: string;
    name: string;
    pluralName: string;
    icon: string;
    /** Mirrors coverImages[0]. Read coverImages instead. */
    coverImage: string;
    /** Every cover the admin uploaded, first one first. Cards rotate through them. */
    coverImages: string[];
    /** How each cover is framed. Covers without an entry fill the frame. */
    coverDisplay?: ImageDisplay[];
    /**
     * 'shared' crops one set of photos for both the dashboard card and the shop
     * banner; 'separate' gives the banner the photos below.
     */
    coverMode: CoverMode;
    /** The banner's own photos — used only in 'separate' mode, kept otherwise. */
    bannerImages?: string[];
    bannerDisplay?: ImageDisplay[];
    heroTitle: string;
    heroSubtitle: string;
    tagline: string;
    colorPresets: string[];
    /** Shape of this collection's product cards, on the shop and in the admin. */
    cardAspect: CardAspect;
    defaultMaxPrice: number;
    order: number;
    productCount: number;
}

/** Everything the create/edit form can set. Slugs are derived server-side. */
export interface ProductTypeInput {
    name: string;
    pluralName: string;
    icon: string;
    /** coverImage is derived from this server-side. */
    coverImages: string[];
    coverDisplay: ImageDisplay[];
    coverMode: CoverMode;
    bannerImages: string[];
    bannerDisplay: ImageDisplay[];
    heroTitle: string;
    heroSubtitle: string;
    tagline: string;
    cardAspect: CardAspect;
}

export const PRODUCT_TYPES_QUERY_KEY = ['product-types'];

export const useProductTypes = () => {
    const queryClient = useQueryClient();

    const { data: productTypes = [], isLoading, error } = useQuery<ProductType[]>({
        queryKey: PRODUCT_TYPES_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/product-types');
            return response.data;
        },
        // The nav renders from this on every page; it changes rarely.
        staleTime: 5 * 60 * 1000,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: PRODUCT_TYPES_QUERY_KEY });
    };

    const createProductTypeMutation = useMutation({
        mutationFn: async (input: Partial<ProductTypeInput>) => {
            const response = await api.post('/product-types', input);
            return response.data as ProductType;
        },
        onSuccess: invalidate,
    });

    const updateProductTypeMutation = useMutation({
        mutationFn: async ({ id, ...input }: Partial<ProductTypeInput> & { id: string }) => {
            const response = await api.put(`/product-types/${id}`, input);
            return response.data as ProductType;
        },
        onSuccess: invalidate,
    });

    const deleteProductTypeMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/product-types/${id}`);
            return id;
        },
        onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    return {
        productTypes,
        isLoading,
        error,
        createProductType: createProductTypeMutation.mutateAsync,
        isCreating: createProductTypeMutation.isPending,
        updateProductType: updateProductTypeMutation.mutateAsync,
        isUpdating: updateProductTypeMutation.isPending,
        deleteProductType: deleteProductTypeMutation.mutateAsync,
        isDeleting: deleteProductTypeMutation.isPending,
    };
};

/** Resolves a URL segment (either slug form) to its type. */
export const useProductTypeBySlug = (slug?: string) => {
    const { productTypes, isLoading } = useProductTypes();

    const productType = slug
        ? productTypes.find((type) => type.pluralSlug === slug || type.slug === slug)
        : undefined;

    return { productType, productTypes, isLoading };
};
