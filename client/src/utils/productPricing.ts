export interface ProductDimensions {
  width?: number | null;
  depth?: number | null;
  height?: number | null;
  unit?: 'cm' | 'in';
}

/** Minimal shape the pricing/gallery helpers need — works for any product-like object. */
export interface PricedProduct {
  price?: number;
  discountPrice?: number | null;
  image?: string;
  images?: string[];
  dimensions?: ProductDimensions | null;
}

/** A discount only counts when it is positive and strictly below the list price. */
export function hasDiscount(product?: PricedProduct | null): boolean {
  if (!product) return false;

  const price = Number(product.price);
  const discountPrice = Number(product.discountPrice);

  return (
    Number.isFinite(price) &&
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price
  );
}

/** What the shopper actually pays. Mirrors server/utils/productPricing.js. */
export function getEffectivePrice(product?: PricedProduct | null): number {
  if (!product) return 0;
  return hasDiscount(product) ? Number(product.discountPrice) : Number(product.price) || 0;
}

/** Whole-number percentage saved, or 0 when there is no discount. */
export function getDiscountPercent(product?: PricedProduct | null): number {
  if (!hasDiscount(product)) return 0;

  const price = Number(product!.price);
  const discountPrice = Number(product!.discountPrice);

  return Math.round(((price - discountPrice) / price) * 100);
}

/** Gallery images, cover first. Falls back to the legacy single `image`. */
export function getProductImages(product?: PricedProduct | null): string[] {
  if (!product) return [];

  const gallery = (product.images ?? []).filter(
    (url): url is string => typeof url === 'string' && url.trim() !== '',
  );

  if (gallery.length > 0) return gallery;
  return product.image ? [product.image] : [];
}

export function getCoverImage(product?: PricedProduct | null): string | undefined {
  return getProductImages(product)[0] ?? product?.image;
}

const isMeasurement = (value?: number | null): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export function hasDimensions(dimensions?: ProductDimensions | null): boolean {
  if (!dimensions) return false;
  return (
    isMeasurement(dimensions.width) ||
    isMeasurement(dimensions.depth) ||
    isMeasurement(dimensions.height)
  );
}

/** e.g. "180 × 90 × 75 cm" — omits any measurement the admin left blank. */
export function formatDimensions(dimensions?: ProductDimensions | null): string {
  if (!hasDimensions(dimensions)) return '';

  const unit = dimensions?.unit === 'in' ? 'in' : 'cm';
  const parts = [dimensions?.width, dimensions?.depth, dimensions?.height]
    .filter(isMeasurement)
    .map((value) => String(value));

  return `${parts.join(' × ')} ${unit}`;
}

export const DIMENSION_LABELS: Array<{ key: 'width' | 'depth' | 'height'; label: string }> = [
  { key: 'width', label: 'Width' },
  { key: 'depth', label: 'Depth' },
  { key: 'height', label: 'Height' },
];
