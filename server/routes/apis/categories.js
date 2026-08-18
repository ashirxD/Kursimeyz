const express = require('express');
const router = express.Router();
const categoriesController = require('../../controller/categories');
const { protect, admin } = require('../../middleware/auth');

// Public: the shop pages read these to build their category tabs.
router.get('/', categoriesController.getCategories);

// Admin-only. Note that categories are normally created implicitly by saving a
// product with a new category name; these exist for explicit management.
router.post('/', protect, admin, categoriesController.createCategory);
router.put('/:id', protect, admin, categoriesController.updateCategory);
router.delete('/:id', protect, admin, categoriesController.deleteCategory);

module.exports = router;
