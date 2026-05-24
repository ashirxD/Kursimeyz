const express = require('express');
const router = express.Router();
const {
    getPendingReviews,
    submitReviews,
    snoozeReviewPrompt,
    skipReviewPrompt,
} = require('../../controller/reviews');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.get('/pending', getPendingReviews);
router.post('/', submitReviews);
router.post('/snooze/:orderId', snoozeReviewPrompt);
router.post('/skip/:orderId', skipReviewPrompt);

module.exports = router;
