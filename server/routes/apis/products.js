const express = require('express');
const router = express.Router();
const productsController = require('../../controller/products');
const authMiddleware = require('../../middleware/auth');

// Public routes (though for an admin dashboard, we might want them protected)
// For now, let's keep GET public but POST/DELETE protected if we have auth logic
router.get('/', productsController.getAllProducts);

// Admin-only routes (assuming middleware handles role check)
router.post('/', productsController.createProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
