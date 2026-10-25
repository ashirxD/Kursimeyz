const express = require('express');
const router = express.Router();
const {
    getProductReviews,
    getPendingReviews,
    submitReviews,
    snoozeReviewPrompt,
    skipReviewPrompt,
} = require('../../controller/reviews');
const { protect } = require('../../middleware/auth');

// Public: shoppers read what others thought before they sign in. Mounted above
// protect on purpose — everything below it needs an account.
router.get('/product/:productId', getProductReviews);

router.use(protect);

router.get('/pending', getPendingReviews);
router.post('/', submitReviews);
router.post('/snooze/:orderId', snoozeReviewPrompt);
router.post('/skip/:orderId', skipReviewPrompt);

module.exports = router;
