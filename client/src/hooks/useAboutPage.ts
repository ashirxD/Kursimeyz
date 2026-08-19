import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/Axios';

/**
 * The About page's content is admin-authored and stored server-side, so both the
 * storefront page and the admin editor read the same shape from the same endpoint.
 *
 * The server normalises every response against its defaults (see
 * server/utils/aboutContent.js), so anything typed here is guaranteed present —
 * no optional fields, no fallbacks needed at the call site.
 */

export const ABOUT_SECTION_KEYS = [
    'hero',
    'values',
    'story',
    'stats',
    'contact',
    'backLink',
] as const;

export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number];

export interface AboutTheme {
    /** Eyebrow dots, the second title line, value icons, badge, primary button. */
    accentColor: string;
    /** Headings and stat numbers. */
    headingColor: string;
    /** Paragraphs and small labels, each rendered at its own opacity. */
    bodyColor: string;
    /** Empty means inherit the site background rather than paint over it. */
    pageBackground: string;
    cardBackground: string;
    contactBackground: string;
}

export interface AboutValueCard {
    icon: string;
    title: string;
    description: string;
}

export interface AboutStat {
    value: string;
    label: string;
}

export type AboutLinkStyle = 'subtle' | 'accent';

export interface AboutContactLink {
    icon: string;
    label: string;
    href: string;
    style: AboutLinkStyle;
}

export interface AboutPageContent {
    theme: AboutTheme;
    /** Render order. Always contains every key exactly once. */
    sectionOrder: AboutSectionKey[];
    hero: {
        enabled: boolean;
        eyebrow: string;
        titleLine1: string;
        titleLine2: string;
        subtitle: string;
    };
    values: {
        enabled: boolean;
        eyebrow: string;
        heading: string;
        items: AboutValueCard[];
    };
    story: {
        enabled: boolean;
        eyebrow: string;
        heading: string;
        paragraphs: string[];
        image: string;
        imageAlt: string;
        imagePosition: 'left' | 'right';
        badgeEnabled: boolean;
        badgeValue: string;
        badgeLabel: string;
    };
    stats: {
        enabled: boolean;
        items: AboutStat[];
    };
    contact: {
        enabled: boolean;
        heading: string;
        subtitle: string;
        links: AboutContactLink[];
    };
    backLink: {
        enabled: boolean;
        label: string;
    };
}

export const ABOUT_PAGE_QUERY_KEY = ['about-page'];

/** Public read, used by the storefront About page. */
export const useAboutPage = () => {
    const { data, isLoading, error } = useQuery<AboutPageContent>({
        queryKey: ABOUT_PAGE_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get('/about-page');
            return response.data;
        },
        // Edited rarely, read on every visit.
        staleTime: 5 * 60 * 1000,
    });

    return { content: data, isLoading, error };
};

/** Admin writes. Save sends the whole content object; the server replaces it. */
export const useAboutPageEditor = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ABOUT_PAGE_QUERY_KEY });
    };

    const saveMutation = useMutation({
        mutationFn: async (content: AboutPageContent) => {
            const response = await api.put('/about-page', content);
            return response.data as AboutPageContent;
        },
        onSuccess: (saved) => {
            // Seed the cache with what was actually stored, so the storefront and
            // the editor agree even when the server pruned or clamped a field.
            queryClient.setQueryData(ABOUT_PAGE_QUERY_KEY, saved);
            invalidate();
        },
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/about-page/reset');
            return response.data as AboutPageContent;
        },
        onSuccess: (saved) => {
            queryClient.setQueryData(ABOUT_PAGE_QUERY_KEY, saved);
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
