/**
 * Mirrors server/utils/slug.js. Used to tell whether what the admin typed
 * matches a saved category, so "Slim", " slim " and "SLIM" count as one.
 */
export function slugify(value: string): string {
  if (typeof value !== 'string') return '';

  return value
    .trim()
    .toLowerCase()
    // Split accents off their base letter so "Café" slugs to "cafe", not "caf".
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Collapses stray whitespace but keeps whatever capitalisation was typed. */
export function normalizeName(value: string): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Naive pluralisation used to pre-fill the product-type form. Mirrors
 * server/utils/productTypes.js — it only has to be right often enough to save
 * typing, since the admin can always correct it.
 */
export function pluralize(value: string): string {
  const name = normalizeName(value);
  if (!name) return '';

  if (/(s|x|z|ch|sh)$/i.test(name)) return `${name}es`;
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}
