const mongoose = require('mongoose');

// A kind of furniture the shop sells — chairs, tables, sofas, and whatever else
// the admin adds later. This is the top of the hierarchy:
//
//   ProductType (chair) -> Category (slim) -> Product
//
// `slug` is the foreign key: it is what Product.category and Category.productType
// store. Both slugs are set once at creation and never change on rename, so
// existing products and shared links keep working when a type is renamed.
const ProductTypeSchema = new mongoose.Schema({
  // Singular display name — "Chair". Drives copy like "Add New Chair".
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 40,
  },
  // Plural display name — "Chairs". Drives nav labels and page titles.
  pluralName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 40,
  },
  // Immutable identity, e.g. "chair". Matches existing Product.category values.
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  // Immutable URL segment, e.g. "chairs" -> /shop/chairs.
  pluralSlug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  // Material Symbols icon name, shown in the sidebar and shop header.
  icon: {
    type: String,
    trim: true,
    default: 'category',
  },
  // Collection cover for the dashboard grid. Falls back to a product photo.
  coverImage: {
    type: String,
    trim: true,
    default: '',
  },
  heroTitle: {
    type: String,
    trim: true,
    default: '',
  },
  heroSubtitle: {
    type: String,
    trim: true,
    default: '',
  },
  // Short line under the name in the dashboard's "Find Your Space" grid.
  tagline: {
    type: String,
    trim: true,
    default: '',
  },
  // Swatches offered in the product form's colour picker.
  colorPresets: {
    type: [String],
    default: ['#3a4d39', '#d27d53', '#8a9a5b', '#4b3621', '#f5f0e6'],
  },
  // Admin grid style: portrait cards 4-up, or landscape cards 2-up.
  cardLayout: {
    type: String,
    enum: ['compact', 'wide'],
    default: 'compact',
  },
  // Starting ceiling for the shop price slider; it expands past this when a
  // product costs more.
  defaultMaxPrice: {
    type: Number,
    min: 0,
    default: 1500,
  },
  // Sidebar / nav ordering.
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProductTypeSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('ProductType', ProductTypeSchema);
