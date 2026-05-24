const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1581412003502-97cc921d5421?w=500';

/**
 * Resolves a product/image URL for display.
 * S3 and other absolute URLs are returned as-is.
 * Legacy relative /uploads paths fall back to placeholder (migrate DB to S3 URLs).
 */
export function resolveImageUrl(
  url?: string | null,
  fallback: string = PLACEHOLDER_IMAGE
): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('data:')) return url;
  return fallback;
}
