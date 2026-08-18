const express = require('express');
const router = express.Router();
const productTypesController = require('../../controller/productTypes');
const { protect, admin } = require('../../middleware/auth');

// Public: the storefront nav, shop pages and dashboard are built from these.
router.get('/', productTypesController.getProductTypes);
router.get('/:slug', productTypesController.getProductTypeBySlug);

// Admin-only.
router.post('/', protect, admin, productTypesController.createProductType);
router.put('/:id', protect, admin, productTypesController.updateProductType);
router.delete('/:id', protect, admin, productTypesController.deleteProductType);

module.exports = router;
