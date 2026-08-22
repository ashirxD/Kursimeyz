const express = require('express');
const router = express.Router();
const shippingCitiesController = require('../../controller/shippingCities');
const { protect, admin } = require('../../middleware/auth');

// Public: checkout suggests these cities and shows their rate.
router.get('/', shippingCitiesController.getShippingCities);

// Admin-only. The rate charged on an order is always read from these rows
// server-side, never taken from the checkout form.
router.post('/', protect, admin, shippingCitiesController.createShippingCity);
router.put('/:id', protect, admin, shippingCitiesController.updateShippingCity);
router.delete('/:id', protect, admin, shippingCitiesController.deleteShippingCity);

module.exports = router;
