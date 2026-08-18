const mongoose = require('mongoose');

// An admin-defined grouping *within* a product type — a chair in the "Slim"
// category. Scoped per type, so a chair "Slim" and a sofa "Slim" are two
// independent rows and each shop page gets its own set of tabs.
//
// Rows are created implicitly: saving a product with a category name that does
// not exist yet upserts it (see resolveSubCategory in controller/categories.js).
const CategorySchema = new mongoose.Schema({
  // ProductType slug. Validated against that collection by the controller.
  productType: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  // Display spelling, e.g. "Slim". First one typed wins and stays canonical.
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  // Match key, e.g. "slim". Products store this too, for filtering.
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One category per name per product type.
CategorySchema.index({ productType: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
