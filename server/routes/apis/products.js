const express = require('express');
const router = express.Router();
const productsController = require('../../controller/products');
const { protect, admin } = require('../../middleware/auth');

// Public: the storefront reads all of these.
router.get('/', productsController.getAllProducts);
router.get('/grouped', productsController.getGroupedProducts);
// Must stay above '/:id', which would otherwise swallow 'materials' as an id.
router.get('/materials', productsController.getMaterials);
router.get('/:id', productsController.getProductById);

// Admin-only, matching every other write route in the API.
router.post('/', protect, admin, productsController.createProduct);
router.put('/:id', protect, admin, productsController.updateProduct);
router.delete('/:id', protect, admin, productsController.deleteProduct);

module.exports = router;
