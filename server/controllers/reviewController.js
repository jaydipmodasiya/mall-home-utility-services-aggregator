const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc   Submit a review
// @route  POST /api/reviews
// @access Private (customer)
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }
    if (booking.isReviewed) {
      return res.status(400).json({ success: false, message: 'Already reviewed this booking' });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment,
      serviceCategory: booking.serviceCategory,
    });

    booking.isReviewed = true;
    await booking.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc   Get reviews for a provider
// @route  GET /api/reviews/provider/:providerId
// @access Public
exports.getProviderReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { providerId: req.params.providerId };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my reviews (customer)
// @route  GET /api/reviews/me
// @access Private (customer)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name avatar' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
