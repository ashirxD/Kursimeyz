const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const { resolveSubCategory } = require('./categories');
const { slugify } = require('../utils/slug');
const { getProductTypeSlugs, isProductType } = require('../utils/productTypes');
const {
    FINISH_PARTS,
    mirrorLegacyColor,
    normalizeFinish,
} = require('../utils/productFinish');

const parseNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
};

// Gallery is stored cover-first; `image` mirrors images[0] so legacy consumers keep working.
const normalizeImages = (images, image) => {
  const list = Array.isArray(images) ? images : [];
  const cleaned = list
    .filter((url) => typeof url === 'string' && url.trim() !== '')
    .map((url) => url.trim());

  const deduped = [...new Set(cleaned)];

  if (deduped.length === 0 && typeof image === 'string' && image.trim() !== '') {
    return [image.trim()];
  }

  return deduped;
};

// Only persist a discount that actually undercuts the list price.
const normalizeDiscountPrice = (discountPrice, price) => {
  const parsedDiscount = parseNonNegativeNumber(discountPrice);
  const parsedPrice = Number(price);

  if (parsedDiscount === undefined || parsedDiscount === 0) return null;
  if (!Number.isFinite(parsedPrice) || parsedDiscount >= parsedPrice) return null;

  return parsedDiscount;
};

const normalizeDimensions = (dimensions) => {
  if (!dimensions || typeof dimensions !== 'object') return undefined;

  const width = parseNonNegativeNumber(dimensions.width);
  const depth = parseNonNegativeNumber(dimensions.depth);
  const height = parseNonNegativeNumber(dimensions.height);

  if (width === undefined && depth === undefined && height === undefined) return undefined;

  return {
    width,
    depth,
    height,
    unit: dimensions.unit === 'in' ? 'in' : 'cm',
  };
};

const buildProductPayload = (body) => {
  const { name, price, image, images, description, color, category, discountPrice, dimensions } = body;

  const gallery = normalizeImages(images, image);
  const finish = normalizeFinish(body.finish);

  return {
    name,
    price,
    image: gallery[0] || image,
    images: gallery,
    description,
    finish,
    // Kept in sync so the cart, checkout and any older reader still find a colour.
    color: mirrorLegacyColor(finish, color),
    category,
    discountPrice: normalizeDiscountPrice(discountPrice, price),
    dimensions: normalizeDimensions(dimensions),
  };
};

// @desc    Materials the admin has used before, offered as form suggestions
// @route   GET /api/products/materials
// @access  Public (only the admin form asks for it)
//
// Read straight off the products rather than kept in their own collection: the
// list is then always accurate, with no upserts to run and no orphans to clean up.
const getMaterials = async (req, res) => {
  try {
    const [body, fabric] = await Promise.all(
      FINISH_PARTS.map((part) => Product.distinct(`finish.${part}.material`))
    );

    // Spellings that differ only in case are one material, so "Linen" and "LINEN"
    // must not both be offered. Which one survives cannot be left to the order
    // distinct() happens to return, or the admin sees a different spelling from
    // one load to the next — so the nicest spelling wins, deterministically:
    // Title Case beats all-lowercase, and both beat SHOUTING.
    const titleCaseScore = (value) =>
      value
        .split(/\s+/)
        .filter(Boolean)
        .reduce((score, word) => {
          const startsCapitalised = /^[A-Z]/.test(word) ? 1 : 0;
          const shouted = word.slice(1).replace(/[^A-Z]/g, '').length;
          return score + startsCapitalised - shouted;
        }, 0);

    const preferred = (a, b) => {
      const difference = titleCaseScore(b) - titleCaseScore(a);
      return difference !== 0 ? difference : a.localeCompare(b);
    };

    const tidy = (values) => {
      const byKey = new Map();

      values
        .filter((value) => typeof value === 'string' && value.trim() !== '')
        .map((value) => value.trim())
        .forEach((value) => {
          const key = value.toLowerCase();
          const current = byKey.get(key);
          if (!current || preferred(value, current) < 0) byKey.set(key, value);
        });

      return [...byKey.values()].sort((a, b) => a.localeCompare(b));
    };

    res.json({ body: tidy(body), fabric: tidy(fabric) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error: error.message });
  }
};

// Get all products (optionally filtered by category)
const getAllProducts = async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice } = req.query;
    const parsedMinPrice = parseNonNegativeNumber(minPrice);
    const parsedMaxPrice = parseNonNegativeNumber(maxPrice);
    let filter = {};

    if (category) {
      filter.category = category;
    }

    // Slugified so tabs work whether the client sends "Slim" or "slim".
    if (subCategory) {
      const subCategorySlug = slugify(subCategory);
      if (subCategorySlug) {
        filter.subCategorySlug = subCategorySlug;
      }
    }

    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
      const range = {};
      if (parsedMinPrice !== undefined) range.$gte = parsedMinPrice;
      if (parsedMaxPrice !== undefined) range.$lte = parsedMaxPrice;

      // Match on whichever price the shopper actually pays.
      filter.$or = [
        { discountPrice: { $not: { $gt: 0 } }, price: range },
        { discountPrice: { $gt: 0, ...range } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);

    // Types are admin-managed rows, so an unknown one is a client error rather
    // than something to silently coerce.
    let category = payload.category;
    if (category) {
      if (!(await isProductType(category))) {
        return res.status(400).json({ message: `Unknown product type "${category}"` });
      }
    } else {
      const fallback = await ProductType.findOne().sort({ order: 1, createdAt: 1 }).lean();
      if (!fallback) {
        return res.status(400).json({ message: 'No product types exist yet' });
      }
      category = fallback.slug;
    }

    // Creates the category on the fly when the admin typed a name that is new.
    const subCategory = await resolveSubCategory(category, req.body.subCategory);

    const newProduct = new Product({
      ...payload,
      ...subCategory,
      category,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Get products grouped by product type for Top Picks
const getGroupedProducts = async (req, res) => {
  try {
    const slugs = await getProductTypeSlugs();
    const grouped = {};

    await Promise.all(
      slugs.map(async (slug) => {
        grouped[slug] = await Product.find({ category: slug }).limit(10).sort({ createdAt: -1 });
      })
    );

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grouped products', error: error.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error: error.message });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { dimensions, ...payload } = buildProductPayload(req.body);

    // Categories are scoped by product type, so fall back to the stored type
    // when the client sends a payload without one.
    const category =
      payload.category || (await Product.findById(id).select('category').lean())?.category;
    const subCategory = await resolveSubCategory(category, req.body.subCategory);

    // $unset keeps a cleared dimensions form from leaving stale numbers behind.
    const fields = { ...payload, ...subCategory };
    const update = dimensions
      ? { $set: { ...fields, dimensions } }
      : { $set: fields, $unset: { dimensions: '' } };

    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

module.exports = {
  getMaterials,
  getAllProducts,
  createProduct,
  getProductById,
  getGroupedProducts,
  deleteProduct,
  updateProduct
};
