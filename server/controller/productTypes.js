const ProductType = require('../models/ProductType');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { normalizeName } = require('../utils/slug');
const { pluralize, buildUniqueSlug } = require('../utils/productTypes');

// One aggregation for every type, so the nav costs a single extra round trip.
const countProductsByType = async () => {
  const rows = await Product.aggregate([
    { $match: { category: { $nin: [null, ''] } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id, row.count]));
};

// Enough for a rotation without turning the dashboard card into a slideshow reel.
const MAX_COVER_IMAGES = 6;

// Covers are stored first-one-first; `coverImage` mirrors coverImages[0] so
// legacy consumers keep working. Mirrors normalizeImages in controller/products.js.
const normalizeCoverImages = (coverImages, coverImage) => {
  const list = Array.isArray(coverImages) ? coverImages : [];
  const cleaned = list
    .filter((url) => typeof url === 'string' && url.trim() !== '')
    .map((url) => url.trim());

  const deduped = [...new Set(cleaned)];

  if (deduped.length === 0 && typeof coverImage === 'string' && coverImage.trim() !== '') {
    return [coverImage.trim()];
  }

  return deduped.slice(0, MAX_COVER_IMAGES);
};

// Rows seeded or saved before covers went plural only have `coverImage`, so the
// array is filled on the way out rather than by migrating the collection.
const toResponse = (type, counts) => ({
  ...type,
  coverImages: normalizeCoverImages(type.coverImages, type.coverImage),
  productCount: counts.get(type.slug) || 0,
});

// Editable copy fields. Names and slugs are handled separately because slugs are
// immutable and names feed the auto-generated plural.
const COPY_FIELDS = ['icon', 'heroTitle', 'heroSubtitle', 'tagline'];

// Untouched unless the request actually carries covers, so a partial update that
// omits them does not wipe what the admin uploaded earlier.
const applyCoverImages = (target, body) => {
  if (!Array.isArray(body.coverImages) && typeof body.coverImage !== 'string') return;

  const covers = normalizeCoverImages(body.coverImages, body.coverImage);
  target.coverImages = covers;
  target.coverImage = covers[0] || '';
};

const applyCopyFields = (target, body) => {
  COPY_FIELDS.forEach((field) => {
    if (typeof body[field] === 'string') target[field] = body[field].trim();
  });

  applyCoverImages(target, body);

  if (body.cardLayout === 'compact' || body.cardLayout === 'wide') {
    target.cardLayout = body.cardLayout;
  }

  if (Array.isArray(body.colorPresets)) {
    const presets = body.colorPresets
      .filter((color) => typeof color === 'string' && color.trim() !== '')
      .map((color) => color.trim());
    if (presets.length > 0) target.colorPresets = presets;
  }

  const maxPrice = Number(body.defaultMaxPrice);
  if (Number.isFinite(maxPrice) && maxPrice > 0) target.defaultMaxPrice = maxPrice;

  return target;
};

// GET /api/product-types
const getProductTypes = async (req, res) => {
  try {
    const [types, counts] = await Promise.all([
      ProductType.find().sort({ order: 1, createdAt: 1 }).lean(),
      countProductsByType(),
    ]);

    res.json(types.map((type) => toResponse(type, counts)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product types', error: error.message });
  }
};

// GET /api/product-types/:slug — accepts either slug, so /shop/chairs and an
// internal "chair" reference both resolve.
const getProductTypeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const type = await ProductType.findOne({
      $or: [{ slug }, { pluralSlug: slug }],
    }).lean();

    if (!type) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    const counts = await countProductsByType();
    res.json(toResponse(type, counts));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product type', error: error.message });
  }
};

// POST /api/product-types
const createProductType = async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    if (!name) {
      return res.status(400).json({ message: 'A name is required' });
    }

    const pluralName = normalizeName(req.body.pluralName) || pluralize(name);

    const [slug, pluralSlug] = await Promise.all([
      buildUniqueSlug(name, 'slug'),
      buildUniqueSlug(pluralName, 'pluralSlug'),
    ]);

    if (!slug || !pluralSlug) {
      return res.status(400).json({ message: 'That name cannot be turned into a URL' });
    }

    // Newest type lands at the end of the sidebar.
    const last = await ProductType.findOne().sort({ order: -1 }).select('order').lean();

    const payload = applyCopyFields(
      {
        name,
        pluralName,
        slug,
        pluralSlug,
        order: (last?.order ?? -1) + 1,
      },
      req.body
    );

    // Sensible defaults so a type created with just a name still reads well.
    if (!payload.heroTitle) payload.heroTitle = `Find your perfect ${name.toLowerCase()}`;
    if (!payload.heroSubtitle) {
      payload.heroSubtitle = `Browse our ${pluralName.toLowerCase()}, crafted for your space.`;
    }
    if (!payload.tagline) payload.tagline = `Our ${pluralName} Collection`;

    const productType = await ProductType.create(payload);
    res.status(201).json(toResponse(productType.toObject(), new Map()));
  } catch (error) {
    res.status(400).json({ message: 'Error creating product type', error: error.message });
  }
};

// PUT /api/product-types/:id — renames and re-styles. Slugs stay put so products
// and shared links keep resolving.
const updateProductType = async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    const name = normalizeName(req.body.name);
    if (name) productType.name = name;

    const pluralName = normalizeName(req.body.pluralName);
    if (pluralName) productType.pluralName = pluralName;
    else if (name) productType.pluralName = pluralize(name);

    if (Number.isFinite(Number(req.body.order))) productType.order = Number(req.body.order);

    applyCopyFields(productType, req.body);
    await productType.save();

    const counts = await countProductsByType();
    res.json(toResponse(productType.toObject(), counts));
  } catch (error) {
    res.status(400).json({ message: 'Error updating product type', error: error.message });
  }
};

// DELETE /api/product-types/:id — refused while products still use it, matching
// how categories behave, so nothing is silently orphaned.
const deleteProductType = async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    const productCount = await Product.countDocuments({ category: productType.slug });
    if (productCount > 0) {
      return res.status(409).json({
        message: `Cannot delete ${productType.pluralName} — ${productCount} product(s) still use it.`,
        productCount,
      });
    }

    // Its categories have no products left either, so they go with it.
    await Category.deleteMany({ productType: productType.slug });
    await productType.deleteOne();

    res.json({ message: 'Product type deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product type', error: error.message });
  }
};

module.exports = {
  getProductTypes,
  getProductTypeBySlug,
  createProductType,
  updateProductType,
  deleteProductType,
};
