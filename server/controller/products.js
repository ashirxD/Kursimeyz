const Product = require('../models/Product');

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

  return {
    name,
    price,
    image: gallery[0] || image,
    images: gallery,
    description,
    color,
    category,
    discountPrice: normalizeDiscountPrice(discountPrice, price),
    dimensions: normalizeDimensions(dimensions),
  };
};

// Get all products (optionally filtered by category)
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const parsedMinPrice = parseNonNegativeNumber(minPrice);
    const parsedMaxPrice = parseNonNegativeNumber(maxPrice);
    let filter = {};

    if (category) {
      filter.category = category;
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
    const newProduct = new Product({
      ...payload,
      category: payload.category || 'chair',
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

// Get products grouped by category for Top Picks
const getGroupedProducts = async (req, res) => {
  try {
    const categories = ['chair', 'table', 'sofa'];
    const grouped = {};

    for (const cat of categories) {
      grouped[cat] = await Product.find({ category: cat }).limit(10).sort({ createdAt: -1 });
    }

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

    // $unset keeps a cleared dimensions form from leaving stale numbers behind.
    const update = dimensions
      ? { $set: { ...payload, dimensions } }
      : { $set: payload, $unset: { dimensions: '' } };

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
  getAllProducts,
  createProduct,
  getProductById,
  getGroupedProducts,
  deleteProduct,
  updateProduct
};
