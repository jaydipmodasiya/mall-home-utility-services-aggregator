const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createBooking, getMyBookings, getBooking,
  getProviderBookings, updateBookingStatus, cancelBooking,
} = require('../controllers/bookingController');

const bookingRules = [
  body('providerId').notEmpty().withMessage('Provider is required'),
  body('serviceCategory').isIn(['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance']).withMessage('Invalid category'),
  body('serviceDescription').notEmpty().isLength({ max: 1000 }).withMessage('Description is required'),
  body('serviceLocation.address').notEmpty().withMessage('Service address is required'),
  body('serviceLocation.city').notEmpty().withMessage('City is required'),
  body('bookingType').isIn(['instant', 'scheduled']).withMessage('Invalid booking type'),
];

router.post('/', protect, authorize('customer'), bookingRules, validate, createBooking);
router.get('/', protect, authorize('customer'), getMyBookings);
router.get('/provider', protect, authorize('provider'), getProviderBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/status', protect, updateBookingStatus);
router.patch('/:id/cancel', protect, authorize('customer'), cancelBooking);

module.exports = router;
