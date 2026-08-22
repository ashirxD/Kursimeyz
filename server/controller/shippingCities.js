const ShippingCity = require('../models/ShippingCity');
const { slugify, normalizeName } = require('../utils/slug');

const toResponse = (city) => ({
    _id: city._id,
    name: city.name,
    slug: city.slug,
    shippingPrice: city.shippingPrice,
});

/** Throws a 400-shaped error so the handlers can report what was wrong. */
const badRequest = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const parseName = (rawName) => {
    const name = normalizeName(rawName);
    const slug = slugify(name);

    if (!slug) {
        throw badRequest('City name is required');
    }

    return { name, slug };
};

const parsePrice = (rawPrice) => {
    const price = Number(rawPrice);

    if (!Number.isFinite(price) || price < 0) {
        throw badRequest('Shipping price must be a number of 0 or more');
    }

    return price;
};

// @desc    List every city with a set rate. Public: checkout suggests these.
// @route   GET /api/shipping-cities
const getShippingCities = async (req, res) => {
    try {
        const cities = await ShippingCity.find().sort({ name: 1 }).lean();
        res.json(cities.map(toResponse));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shipping cities', error: error.message });
    }
};

// @desc    Add a city
// @route   POST /api/shipping-cities
// @access  Admin
const createShippingCity = async (req, res) => {
    try {
        const { name, slug } = parseName(req.body.name);
        const shippingPrice = parsePrice(req.body.shippingPrice);

        const existing = await ShippingCity.findOne({ slug });
        if (existing) {
            return res.status(409).json({ message: `${existing.name} is already on the list` });
        }

        const city = await ShippingCity.create({ name, slug, shippingPrice });
        res.status(201).json(toResponse(city));
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error creating shipping city', error: error.message });
    }
};

// @desc    Rename a city or change its rate
// @route   PUT /api/shipping-cities/:id
// @access  Admin
const updateShippingCity = async (req, res) => {
    try {
        const city = await ShippingCity.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'Shipping city not found' });
        }

        if (req.body.name !== undefined) {
            const { name, slug } = parseName(req.body.name);

            // Renaming onto another city's slug would break rate lookups, which
            // match on slug.
            const clash = await ShippingCity.findOne({ slug, _id: { $ne: city._id } });
            if (clash) {
                return res.status(409).json({ message: `${clash.name} is already on the list` });
            }

            city.name = name;
            city.slug = slug;
        }

        if (req.body.shippingPrice !== undefined) {
            city.shippingPrice = parsePrice(req.body.shippingPrice);
        }

        await city.save();
        res.json(toResponse(city));
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error updating shipping city', error: error.message });
    }
};

// @desc    Remove a city. Orders already placed keep the price they were charged.
// @route   DELETE /api/shipping-cities/:id
// @access  Admin
const deleteShippingCity = async (req, res) => {
    try {
        const city = await ShippingCity.findByIdAndDelete(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'Shipping city not found' });
        }

        res.json({ message: 'Shipping city removed', _id: city._id });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting shipping city', error: error.message });
    }
};

module.exports = {
    getShippingCities,
    createShippingCity,
    updateShippingCity,
    deleteShippingCity,
};
