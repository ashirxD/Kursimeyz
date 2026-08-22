import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

/**
 * The storefront footer is admin-authored and stored server-side, so the shop
 * and the admin editor read the same shape from the same endpoint.
 *
 * The server normalises every response against its defaults (see
 * server/utils/footerContent.js), so anything typed here is guaranteed present —
 * no optional fields, no fallbacks needed at the call site.
 */

/** Networks the footer can link to. Each draws its own brand mark. */
export type SocialPlatform =
    | 'whatsapp'
    | 'facebook'
    | 'instagram'
    | 'tiktok'
    | 'youtube'
    | 'pinterest'
    | 'linkedin'
    | 'x';

export interface FooterLink {
    label: string;
    /** http(s), mailto:, tel:, or a site path starting with '/'. */
    href: string;
}

export interface FooterColumn {
    heading: string;
    links: FooterLink[];
}

export interface SocialLink {
    platform: SocialPlatform;
    href: string;
}

export interface FooterContent {
    enabled: boolean;
    theme: {
        backgroundColor: string;
        /** Headings, hover states and the contact glyphs. */
        accentColor: string;
        /** Everything else, drawn at a few different opacities. */
        textColor: string;
    };
    brand: {
        showLogo: boolean;
        tagline: string;
    };
    /** Built from the admin's product types, not from stored links. */
    collections: {
        enabled: boolean;
        heading: string;
    };
    columns: FooterColumn[];
    contact: {
        enabled: boolean;
        heading: string;
        /** The shop's street address. Line breaks survive to the footer. */
        address: string;
        /** A maps link for the address. Empty renders it as plain text. */
        mapUrl: string;
        phone: string;
        email: string;
        hours: string;
    };
    social: {
        enabled: boolean;
        items: SocialLink[];
    };
    bottom: {
        /** '{year}' is replaced with the current year when rendered. */
        copyright: string;
        links: FooterLink[];
    };
}

export const FOOTER_QUERY_KEY = ['footer'];

/** Public read, used by the storefront layout. */
export const useFooter = () => {
    const { data, isLoading, error } = useQuery<FooterContent>({
        queryKey: FOOTER_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/footer');
            return response.data;
        },
        // On every page of the shop, edited rarely.
        staleTime: 5 * 60 * 1000,
    });

    return { content: data, isLoading, error };
};

/** Admin writes. Save sends the whole content object; the server replaces it. */
export const useFooterEditor = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: FOOTER_QUERY_KEY });
    };

    const saveMutation = useMutation({
        mutationFn: async (content: FooterContent) => {
            const response = await api.put('/footer', content);
            return response.data as FooterContent;
        },
        onSuccess: (saved) => {
            // Seed the cache with what was actually stored, so the storefront and
            // the editor agree even when the server pruned or clamped a field.
            queryClient.setQueryData(FOOTER_QUERY_KEY, saved);
            invalidate();
        },
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/footer/reset');
            return response.data as FooterContent;
        },
        onSuccess: (saved) => {
            queryClient.setQueryData(FOOTER_QUERY_KEY, saved);
            invalidate();
        },
    });

    return {
        save: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        reset: resetMutation.mutateAsync,
        isResetting: resetMutation.isPending,
    };
};
