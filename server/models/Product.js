const mongoose = require('mongoose');

const DimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number, min: 0 },
    depth: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Sale price shown alongside the struck-through `price`. Null/undefined means no discount.
  discountPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  // Cover image, always kept in sync with images[0].
  image: {
    type: String,
    required: true,
  },
  // Full gallery, cover first. Legacy products only have `image`.
  images: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  dimensions: {
    type: DimensionsSchema,
    default: undefined,
  },
  color: {
    type: String,
    required: true,
  },
  // The kind of furniture this is — a ProductType slug. Admins can add types at
  // runtime, so this is validated against that collection in the controller
  // rather than by a fixed enum here.
  category: {
    type: String,
    trim: true,
    lowercase: true,
  },
  // Admin-defined grouping inside that kind, e.g. a chair in "Slim".
  // The display name is denormalized so cards and forms need no join; the slug
  // is what shop tabs filter on. Both are kept in sync with models/Category.js.
  subCategory: {
    type: String,
    trim: true,
    default: null,
  },
  subCategorySlug: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Every shop and admin listing filters by type, then optionally by category.
ProductSchema.index({ category: 1, subCategorySlug: 1 });

module.exports = mongoose.model('Product', ProductSchema);
