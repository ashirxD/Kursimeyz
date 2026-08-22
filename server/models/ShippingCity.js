const mongoose = require('mongoose');

/**
 * A city the shop delivers to at a known rate. Checkout offers these as
 * suggestions; anything the customer types that does not match one is a custom
 * city, whose rate is agreed with them after the order (see utils/shipping.js).
 *
 * `slug` is what matching runs on, so "lahore", "Lahore" and " LAHORE " are one
 * city rather than three rows — same reason Category slugs exist.
 */
const ShippingCitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    shippingPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ShippingCity', ShippingCitySchema);
