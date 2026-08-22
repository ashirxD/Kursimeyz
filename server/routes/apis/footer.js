const express = require('express');
const router = express.Router();
const footerController = require('../../controller/footer');
const { protect, admin } = require('../../middleware/auth');

// Public: every storefront page renders its footer from this.
router.get('/', footerController.getFooter);

// Admin-only.
router.put('/', protect, admin, footerController.updateFooter);
router.post('/reset', protect, admin, footerController.resetFooter);

module.exports = router;
