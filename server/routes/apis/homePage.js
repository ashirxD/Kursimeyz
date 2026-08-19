const express = require('express');
const router = express.Router();
const homePageController = require('../../controller/homePage');
const { protect, admin } = require('../../middleware/auth');

// Public: the storefront dashboard hero renders from this.
router.get('/', homePageController.getHomePage);

// Admin-only.
router.put('/', protect, admin, homePageController.updateHomePage);
router.post('/reset', protect, admin, homePageController.resetHomePage);

module.exports = router;
