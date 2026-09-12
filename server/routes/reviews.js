const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getProviderReviews, getMyReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
