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

// A colour the admin chose. Usually just a hex, but when they circled a spot on a
// photo of the real material, `image` holds that cropped circle and is shown
// instead — `hex` is then the average of the circle, kept as a fallback for
// anywhere an image will not do (emails, PDFs, tiny dots).
const SwatchSchema = new mongoose.Schema(
  {
    hex: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

// One half of the finish: what this part is made of, and what colour it is.
const FinishPartSchema = new mongoose.Schema(
  {
    color: { type: SwatchSchema, default: () => ({}) },
    // Free text, e.g. "Solid Oak" or "Linen". Past values are offered as
    // suggestions in the product form; see controller/products.js getMaterials.
    material: { type: String, trim: true, default: '' },
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
  // Body and fabric each carry their own colour and material. Empty parts are
  // simply not shown. See utils/productFinish.js.
  finish: {
    body: { type: FinishPartSchema, default: () => ({}) },
    fabric: { type: FinishPartSchema, default: () => ({}) },
  },
  // Mirrors finish.fabric.color.hex, the way `image` mirrors images[0]. Kept so
  // the cart, checkout summary and any older reader keep working, and so products
  // saved before the finish existed still have their colour somewhere.
  color: {
    type: String,
    trim: true,
    default: '',
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
