const ProductType = require('../models/ProductType');
const { slugify, normalizeName } = require('./slug');

// Product types used to be a hardcoded enum; they are admin-managed rows now,
// so validity is a lookup rather than an array membership test.
const isProductType = async (slug) => {
  if (typeof slug !== 'string' || slug === '') return false;
  return (await ProductType.exists({ slug })) !== null;
};

// Ordered slugs, for anything that needs to walk every type (e.g. Top Picks).
const getProductTypeSlugs = async () => {
  const types = await ProductType.find().sort({ order: 1, createdAt: 1 }).select('slug').lean();
  return types.map((type) => type.slug);
};

// Naive pluralisation, only used to pre-fill the admin form — the admin can
// always correct it, so it does not need to handle every English irregular.
const pluralize = (value) => {
  const name = normalizeName(value);
  if (!name) return '';

  if (/(s|x|z|ch|sh)$/i.test(name)) return `${name}es`;
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
};

/**
 * Both slugs are immutable, so a name that collides with an existing type gets a
 * numeric suffix rather than failing the unique index.
 */
const buildUniqueSlug = async (base, field) => {
  const root = slugify(base);
  if (!root) return '';

  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? root : `${root}-${suffix + 1}`;
    if (!(await ProductType.exists({ [field]: candidate }))) return candidate;
  }

  return `${root}-${Date.now()}`;
};

module.exports = { isProductType, getProductTypeSlugs, pluralize, buildUniqueSlug };
