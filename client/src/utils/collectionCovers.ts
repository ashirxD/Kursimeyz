import type { ProductType } from '@/hooks/useProductTypes';
import type { ImageDisplay } from '@/utils/productImageDisplay';

/** A set of cover photos with the framing the admin gave each. */
export interface CoverSet {
    images: string[];
    display: ImageDisplay[];
}

/** The tall card on the dashboard ("Find Your Space"). */
export const getTallCovers = (type: ProductType): CoverSet => ({
    images: type.coverImages ?? [],
    display: type.coverDisplay ?? [],
});

/**
 * The wide banner on the shop page.
 *
 * In 'separate' mode it has photos of its own; in 'shared' mode — or in
 * 'separate' mode before any have been added — it shows the tall card's photos,
 * so a banner is never emptier than the card it sits beside.
 */
export const getBannerCovers = (type: ProductType): CoverSet => {
    if (type.coverMode === 'separate' && (type.bannerImages?.length ?? 0) > 0) {
        return { images: type.bannerImages ?? [], display: type.bannerDisplay ?? [] };
    }

    return getTallCovers(type);
};
