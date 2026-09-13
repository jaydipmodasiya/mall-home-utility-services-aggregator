const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createReview, getProviderReviews, getMyReviews } = require('../controllers/reviewController');

router.post('/', protect, authorize('customer'), createReview);
router.get('/me', protect, getMyReviews);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
