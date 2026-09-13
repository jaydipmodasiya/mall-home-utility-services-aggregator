const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const ProviderDiscovery = require('../models/ProviderDiscovery');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      discoveryEvents,
      discoverySessions,
      bookingSessions,
      ratingSummary,
      completionSummary,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      ServiceProvider.countDocuments({ verificationStatus: 'approved' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] } }),
      Dispute.countDocuments({ status: 'open' }),
      ProviderDiscovery.countDocuments(),
      ProviderDiscovery.distinct('sessionId'),
      Booking.distinct('sessionId', { sessionId: { $exists: true, $nin: [null, ''] } }),
      Review.aggregate([{ $group: { _id: null, average: { $avg: '$rating' } } }]),
      Booking.aggregate([
        { $match: { status: 'completed', completedAt: { $exists: true } } },
        { $project: { hours: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 3600000] } } },
        { $group: { _id: null, average: { $avg: '$hours' } } },
      ]),
    ]);

    const avgRating = Number((ratingSummary[0]?.average || 0).toFixed(1));
    const avgCompletionHours = Number((completionSummary[0]?.average || 0).toFixed(1));
    const discoverySessionSet = new Set(discoverySessions);
    const convertedSessions = bookingSessions.filter((sessionId) => discoverySessionSet.has(sessionId)).length;

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
        providerDiscoveryEvents: discoveryEvents,
        bookingConversionRate: discoverySessions.length > 0 ? Number(((convertedSessions / discoverySessions.length) * 100).toFixed(1)) : 0,
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
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const filter = {};
    if (role && ['customer', 'provider', 'admin'].includes(role)) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' } }, { email: { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' } }];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), users });
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

    if (role !== undefined) {
      return res.status(400).json({ success: false, message: 'Role changes are disabled. Use explicit provider registration.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

