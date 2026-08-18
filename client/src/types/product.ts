import type { ProductDimensions } from '@/utils/productPricing';

/**
 * A product as the admin screens use it — `id` normalized from Mongo's `_id`.
 * Lives here rather than next to a page so every screen shares one definition.
 */
export interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    image: string;
    images?: string[];
    description: string;
    dimensions?: ProductDimensions | null;
    color: string;
    /** ProductType slug, e.g. "chair". */
    category?: string;
    /** Category display name within that type, e.g. "Slim". */
    subCategory?: string | null;
    /** Slug of the same category — what the shop tabs filter on. */
    subCategorySlug?: string | null;
    averageRating?: number;
    ratingCount?: number;
}
