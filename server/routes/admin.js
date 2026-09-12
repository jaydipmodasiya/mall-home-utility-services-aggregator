const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCategories } = require('../controllers/categoryController');
const { createCategory, updateCategory } = require('../controllers/categoryController');
const { getAnalytics, getUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { adminGetProviders, adminVerifyProvider } = require('../controllers/providerController');
const { adminGetBookings } = require('../controllers/bookingController');
const { adminGetDisputes, adminUpdateDispute } = require('../controllers/disputeController');

// Categories (admin)
router.post('/categories', protect, authorize('admin'), createCategory);
router.patch('/categories/:id', protect, authorize('admin'), updateCategory);

// Analytics
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// User management
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Provider verification
router.get('/providers', protect, authorize('admin'), adminGetProviders);
router.patch('/providers/:id/verify', protect, authorize('admin'), adminVerifyProvider);

// Bookings monitoring
router.get('/bookings', protect, authorize('admin'), adminGetBookings);

// Dispute management
router.get('/disputes', protect, authorize('admin'), adminGetDisputes);
router.patch('/disputes/:id', protect, authorize('admin'), adminUpdateDispute);

module.exports = router;
