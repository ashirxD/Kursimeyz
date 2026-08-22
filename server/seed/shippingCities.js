const ShippingCity = require('../models/ShippingCity');
const { slugify } = require('../utils/slug');

// The cities most orders come from, with a placeholder rate the admin is meant
// to adjust from /admin/shipping. Every other city is handled as a custom one.
const DEFAULT_SHIPPING_PRICE = 500;

const POPULAR_PUNJAB_CITIES = [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sahiwal',
    'Sheikhupura',
    'Gujrat',
    'Jhelum',
    'Kasur',
    'Okara',
    'Rahim Yar Khan',
];

/**
 * Runs on boot. Only seeds into an empty collection, so an admin who deletes or
 * reprices a city does not get it silently resurrected on the next restart —
 * same rule as the product type seed.
 */
const seedShippingCities = async () => {
    try {
        const existing = await ShippingCity.estimatedDocumentCount();
        if (existing > 0) return;

        await ShippingCity.insertMany(
            POPULAR_PUNJAB_CITIES.map((name) => ({
                name,
                slug: slugify(name),
                shippingPrice: DEFAULT_SHIPPING_PRICE,
            }))
        );

        console.log(`Seeded ${POPULAR_PUNJAB_CITIES.length} shipping cities at Rs. ${DEFAULT_SHIPPING_PRICE}`);
    } catch (error) {
        console.error('Failed to seed shipping cities:', error.message);
    }
};

module.exports = { seedShippingCities, POPULAR_PUNJAB_CITIES, DEFAULT_SHIPPING_PRICE };
