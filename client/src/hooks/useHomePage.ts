import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

/**
 * The dashboard hero is admin-authored and stored server-side, so the storefront
 * and the admin editor read the same shape from the same endpoint.
 *
 * The server normalises every response against its defaults (see
 * server/utils/homeContent.js), so anything typed here is guaranteed present —
 * no optional fields, no fallbacks needed at the call site.
 */

export type HeroBadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** 'scroll' jumps to the collections grid; 'link' follows the href. */
export type HeroCtaAction = 'scroll' | 'link';

export interface HeroHeadlineLine {
    text: string;
    color: string;
}

export interface HeroBadge {
    icon: string;
    /** Tints the pill, its border and the glyph. */
    color: string;
    position: HeroBadgePosition;
}

export interface HomeHeroContent {
    enabled: boolean;
    kicker: {
        text: string;
        dotColor: string;
        /** Rendered at 40% opacity. */
        textColor: string;
    };
    /** One line each, stacked, every line its own colour. */
    headlineLines: HeroHeadlineLine[];
    subtitle: string;
    /** Rendered at 50% opacity. */
    subtitleColor: string;
    cta: {
        enabled: boolean;
        label: string;
        icon: string;
        action: HeroCtaAction;
        /** Only used when action is 'link'. */
        href: string;
        backgroundColor: string;
        textColor: string;
    };
    image: {
        url: string;
        alt: string;
        /** The tilted panel behind the photo. */
        backdropColor: string;
    };
    badges: {
        enabled: boolean;
        items: HeroBadge[];
    };
}

export interface HomePageContent {
    hero: HomeHeroContent;
}

export const HOME_PAGE_QUERY_KEY = ['home-page'];

/** Public read, used by the storefront dashboard. */
export const useHomePage = () => {
    const { data, isLoading, error } = useQuery<HomePageContent>({
        queryKey: HOME_PAGE_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/home-page');
            return response.data;
        },
        // Edited rarely, read on every visit to the busiest page on the site.
        staleTime: 5 * 60 * 1000,
    });

    return { content: data, isLoading, error };
};

/** Admin writes. Save sends the whole content object; the server replaces it. */
export const useHomePageEditor = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: HOME_PAGE_QUERY_KEY });
    };

    const saveMutation = useMutation({
        mutationFn: async (content: HomePageContent) => {
            const response = await api.put('/home-page', content);
            return response.data as HomePageContent;
        },
        onSuccess: (saved) => {
            // Seed the cache with what was actually stored, so the storefront and
            // the editor agree even when the server pruned or clamped a field.
            queryClient.setQueryData(HOME_PAGE_QUERY_KEY, saved);
            invalidate();
        },
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/home-page/reset');
            return response.data as HomePageContent;
        },
        onSuccess: (saved) => {
            queryClient.setQueryData(HOME_PAGE_QUERY_KEY, saved);
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
