import type { ProductDimensions } from '@/utils/productPricing';
import type { ProductFinish } from '@/utils/productFinish';

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
    /** Body and fabric colour + material. Absent on products saved before it. */
    finish?: ProductFinish | null;
    /** Legacy single colour, mirroring finish.fabric.color.hex. */
    color?: string;
    /** ProductType slug, e.g. "chair". */
    category?: string;
    /** Category display name within that type, e.g. "Slim". */
    subCategory?: string | null;
    /** Slug of the same category — what the shop tabs filter on. */
    subCategorySlug?: string | null;
    averageRating?: number;
    ratingCount?: number;
}
