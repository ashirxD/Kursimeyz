const ShippingCity = require('../models/ShippingCity');
const { slugify } = require('./slug');

/**
 * The rate for whatever city the customer typed.
 *
 * A city that is not on the list gets no charge rather than a guessed one: the
 * order is accepted, checkout tells the customer the rate will be confirmed over
 * WhatsApp, and `isCustomCity` marks the order so an admin knows to agree one.
 * Never trust a shipping price sent by the client — this is the only source.
 */
const resolveShippingPrice = async (cityName) => {
    const slug = slugify(cityName);

    if (!slug) {
        return { shippingPrice: 0, isCustomCity: true };
    }

    const city = await ShippingCity.findOne({ slug });

    if (!city) {
        return { shippingPrice: 0, isCustomCity: true };
    }

    return { shippingPrice: city.shippingPrice, isCustomCity: false };
};

module.exports = { resolveShippingPrice };
