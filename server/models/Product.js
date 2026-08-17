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
  category: {
    type: String,
    enum: ['chair', 'table', 'sofa', 'bed', 'other'],
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

module.exports = mongoose.model('Product', ProductSchema);
