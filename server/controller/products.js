const Product = require('../models/Product');

// Get all products (optionally filtered by category)
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
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
    const { name, price, image, description, color, category } = req.body;
    const newProduct = new Product({
      name,
      price,
      image,
      description,
      color,
      category: category || 'chair',
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
    const { name, price, image, description, color, category } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, image, description, color, category },
      { new: true, runValidators: true }
    );

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
