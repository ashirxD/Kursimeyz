const express = require('express');
const router = express.Router();
const aboutPageController = require('../../controller/aboutPage');
const { protect, admin } = require('../../middleware/auth');

// Public: the storefront About page renders from this.
router.get('/', aboutPageController.getAboutPage);

// Admin-only.
router.put('/', protect, admin, aboutPageController.updateAboutPage);
router.post('/reset', protect, admin, aboutPageController.resetAboutPage);

module.exports = router;
