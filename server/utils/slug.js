// Categories are matched on their slug, so "Slim", " slim " and "SLIM" all
// resolve to one row instead of three near-duplicate tabs on the shop page.
// Mirrors client/src/utils/slug.ts.
const slugify = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .trim()
    .toLowerCase()
    // Split accents off their base letter so "Café" slugs to "cafe", not "caf".
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Collapses stray whitespace but keeps whatever capitalisation the admin typed.
const normalizeName = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

module.exports = { slugify, normalizeName };
