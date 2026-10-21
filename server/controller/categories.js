const Category = require('../models/Category');
const Product = require('../models/Product');
const { isProductType } = require('../utils/productTypes');
const { slugify, normalizeName } = require('../utils/slug');
const { sendError } = require('../middleware/errorHandler');

// One aggregation covers every category, so listing tabs stays a single extra
// round trip no matter how many categories exist.
const countProductsByCategory = async (productType) => {
  const match = { subCategorySlug: { $nin: [null, ''] } };
  if (productType) match.category = productType;

  const rows = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: { productType: '$category', slug: '$subCategorySlug' },
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [`${row._id.productType}:${row._id.slug}`, row.count]));
};

const withProductCount = (category, counts) => ({
  _id: category._id,
  productType: category.productType,
  name: category.name,
  slug: category.slug,
  createdAt: category.createdAt,
  productCount: counts.get(`${category.productType}:${category.slug}`) || 0,
});

/**
 * Turns whatever the admin typed into the canonical category for that product
 * type, creating the category when it is new. Returns the two fields a product
 * stores; a blank name clears the product's category.
 *
 * `$setOnInsert` means the first spelling stays canonical — typing "slim" later
 * still resolves to the existing "Slim", so tabs never split on casing.
 */
const resolveSubCategory = async (productType, rawName) => {
  const name = normalizeName(rawName);
  const slug = slugify(name);

  if (!slug || !(await isProductType(productType))) {
    return { subCategory: null, subCategorySlug: null };
  }

  const category = await Category.findOneAndUpdate(
    { productType, slug },
    { $setOnInsert: { productType, slug, name, createdAt: new Date() } },
    { upsert: true, new: true }
  );

  return { subCategory: category.name, subCategorySlug: category.slug };
};

// GET /api/categories?productType=chair
const getCategories = async (req, res) => {
  try {
    const { productType } = req.query;
    const filter = {};

    if (productType) {
      if (!(await isProductType(productType))) {
        return res.status(400).json({ message: "That product type doesn't exist. Please refresh the page and try again." });
      }
      filter.productType = productType;
    }

    const [categories, counts] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).lean(),
      countProductsByCategory(productType),
    ]);

    res.json(categories.map((category) => withProductCount(category, counts)));
  } catch (error) {
    return sendError(res, error, 'We couldn\'t load the categories. Please refresh the page and try again.');
  }
};

// POST /api/categories — idempotent, so re-adding an existing name is not an error.
const createCategory = async (req, res) => {
  try {
    const { productType, name } = req.body;

    if (!(await isProductType(productType))) {
      return res.status(400).json({ message: 'Please choose a product type.' });
    }

    const normalizedName = normalizeName(name);
    const slug = slugify(normalizedName);

    if (!slug) {
      return res.status(400).json({ message: 'Please enter a category name.' });
    }

    const existing = await Category.findOne({ productType, slug }).lean();
    if (existing) {
      const counts = await countProductsByCategory(productType);
      return res.json(withProductCount(existing, counts));
    }

    const category = await Category.create({ productType, name: normalizedName, slug });
    res.status(201).json({ ...category.toObject(), productCount: 0 });
  } catch (error) {
    return sendError(res, error, 'We couldn\'t create that category. Please check the details and try again.');
  }
};

// PUT /api/categories/:id — renaming re-slugs, so every product carrying the old
// slug is migrated in the same request.
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "We couldn't find that category. It may have been removed." });
    }

    const name = normalizeName(req.body.name);
    const slug = slugify(name);

    if (!slug) {
      return res.status(400).json({ message: 'Please enter a category name.' });
    }

    if (slug !== category.slug) {
      const clash = await Category.findOne({
        productType: category.productType,
        slug,
        _id: { $ne: category._id },
      });

      if (clash) {
        return res.status(409).json({ message: `A "${clash.name}" category already exists` });
      }
    }

    const previousSlug = category.slug;
    category.name = name;
    category.slug = slug;
    await category.save();

    await Product.updateMany(
      { category: category.productType, subCategorySlug: previousSlug },
      { $set: { subCategory: name, subCategorySlug: slug } }
    );

    res.json(category);
  } catch (error) {
    return sendError(res, error, 'We couldn\'t update that category. Please try again.');
  }
};

// DELETE /api/categories/:id — refused while products still reference it, so no
// product is ever silently un-categorized.
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "We couldn't find that category. It may have been removed." });
    }

    const productCount = await Product.countDocuments({
      category: category.productType,
      subCategorySlug: category.slug,
    });

    if (productCount > 0) {
      return res.status(409).json({
        message: `Cannot delete "${category.name}" — ${productCount} product(s) still use it.`,
        productCount,
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    return sendError(res, error, 'We couldn\'t delete that category. Please try again.');
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  resolveSubCategory,
};
