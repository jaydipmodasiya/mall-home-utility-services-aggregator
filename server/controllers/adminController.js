const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

// @desc   Get admin analytics / KPIs
// @route  GET /api/admin/analytics
// @access Private (admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProviders,
      verifiedProviders,
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      openDisputes,
      allReviews,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      ServiceProvider.countDocuments({ verificationStatus: 'approved' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] } }),
      Dispute.countDocuments({ status: 'open' }),
      Review.find().select('rating'),
    ]);

    // Average satisfaction rating
    const avgRating =
      allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0;

    // Average completion time (in hours)
    const completedWithTime = await Booking.find({
      status: 'completed',
      completedAt: { $exists: true },
    }).select('createdAt completedAt');
    const avgCompletionHours =
      completedWithTime.length > 0
        ? (
            completedWithTime.reduce((sum, b) => {
              const diff = (new Date(b.completedAt) - new Date(b.createdAt)) / 3600000;
              return sum + diff;
            }, 0) / completedWithTime.length
          ).toFixed(1)
        : 0;

    // Bookings by category
    const bookingsByCategory = await Booking.aggregate([
      { $group: { _id: '$serviceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const bookingsByMonth = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      kpis: {
        totalUsers,
        totalProviders,
        verifiedProviders,
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        openDisputes,
        avgRating: Number(avgRating),
        avgCompletionHours: Number(avgCompletionHours),
        recentUsers,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      },
      charts: { bookingsByCategory, bookingsByMonth },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: get all users
// @route  GET /api/admin/users
// @access Private (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, users });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: toggle user active status / role
// @route  PATCH /api/admin/users/:id
// @access Private (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;

    // Prevent self-deactivation
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own admin account' });
    }

    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    // Role changes: only allow customer/provider — admin role cannot be granted via API
    if (role !== undefined) {
      const ALLOWED_ROLES = ['customer', 'provider'];
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role. Admin role can only be set via database.' });
      }
      updates.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: delete user
// @route  DELETE /api/admin/users/:id
// @access Private (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot deactivate or delete the active admin account from this route.' });
    }

    const providerProfile = await ServiceProvider.findOne({ userId: user._id }).select('_id');
    const hasBookings = await Booking.exists({
      $or: [
        { customerId: user._id },
        ...(providerProfile ? [{ providerId: providerProfile._id }] : []),
      ],
    });
    const hasReviews = await Review.exists({ customerId: user._id });
    const hasDisputes = await Dispute.exists({ raisedBy: user._id });

    if (hasBookings || hasReviews || hasDisputes) {
      return res.status(400).json({
        success: false,
        message: 'This user has related bookings, reviews, or disputes. Deactivate instead of deleting to preserve data integrity.',
      });
    }

    user.isActive = false;
    await user.save();

    if (providerProfile) {
      await ServiceProvider.findByIdAndUpdate(providerProfile._id, {
        isVerified: false,
        verificationStatus: 'rejected',
        isAvailable: false,
      });
    }

    res.json({ success: true, message: 'User deactivated successfully to preserve data integrity.' });
  } catch (error) {
    next(error);
  }
};
