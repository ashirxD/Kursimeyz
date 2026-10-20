const mongoose = require('mongoose');
const { MAX_ZOOM, MAX_PADDING } = require('../utils/productImageDisplay');

// How an uploaded photo is framed where it is shown: fit or fill, zoom, which
// part is in view, breathing room and a backdrop. The upload itself is never
// touched; these numbers are applied when it is drawn. See
// utils/productImageDisplay.js, which validates every write.
const framingFields = {
  // cover fills the frame and crops; contain shows the whole photo.
  fit: { type: String, enum: ['cover', 'contain'], default: 'contain' },
  zoom: { type: Number, min: 1, max: MAX_ZOOM, default: 1 },
  // Which part of the photo is in view, as a percentage (50/50 is centred).
  x: { type: Number, min: 0, max: 100, default: 50 },
  y: { type: Number, min: 0, max: 100, default: 50 },
  // Breathing room around a contained photo, as a percentage of the frame width.
  padding: { type: Number, min: 0, max: MAX_PADDING, default: 7 },
  // Hex behind the photo. Empty means the shop's warm off-white.
  background: { type: String, trim: true, default: '' },
};

// One entry per photo in a gallery. Keyed by `url`, not by position, so
// reordering the gallery never moves a crop onto the wrong photo.
const ImageDisplaySchema = new mongoose.Schema(
  { url: { type: String, required: true, trim: true }, ...framingFields },
  { _id: false }
);

// For a slot that holds exactly one photo (the home hero, the About story).
const FramingSchema = new mongoose.Schema({ ...framingFields }, { _id: false });

module.exports = { ImageDisplaySchema, FramingSchema };
