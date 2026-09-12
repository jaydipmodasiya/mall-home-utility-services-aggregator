const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');

/* ─────────────────────────────────────────────────────
   Valid status transitions (server-authoritative)
   'accepted' removed — provider accepting = 'assigned'
───────────────────────────────────────────────────── */
const ALLOWED_TRANSITIONS = {
  provider: {
    pending:     ['assigned', 'rejected'],  // accept → assigned; reject → rejected
    assigned:    ['in_progress'],
    in_progress: ['completed'],
  },
  customer: {
    pending:  ['cancelled'],
    assigned: ['cancelled'],
  },
  admin: {
    pending:     ['cancelled', 'assigned', 'rejected'],
    assigned:    ['cancelled', 'in_progress'],
    in_progress: ['cancelled', 'completed'],
  },
};

const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const timeToMinutes = (value) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || '');
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

// @desc   Create booking
// @route  POST /api/bookings
// @access Private (customer)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      providerId, serviceCategory, serviceDescription,
      bookingType, scheduledAt, serviceLocation,
    } = req.body;

    // ── Validate required fields ──────────────────────
    if (!providerId || !serviceCategory || !serviceDescription || !serviceLocation) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }
    if (!serviceLocation.address || !serviceLocation.city) {
      return res.status(400).json({ success: false, message: 'Service location address and city are required' });
    }

    // ── Validate category enum ────────────────────────
    const VALID_CATS = ['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance'];
    if (!VALID_CATS.includes(serviceCategory)) {
      return res.status(400).json({ success: false, message: 'Invalid service category' });
    }

    // ── Validate booking type ─────────────────────────
    const bType = bookingType === 'scheduled' ? 'scheduled' : 'instant';

    // ── Validate scheduled time (server-side) ─────────
    if (bType === 'scheduled') {
      if (!scheduledAt) {
        return res.status(400).json({ success: false, message: 'Scheduled time is required for scheduled bookings' });
      }
      const schedDate = new Date(scheduledAt);
      if (isNaN(schedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid scheduled date/time' });
      }
      if (schedDate.getTime() <= Date.now() + 30 * 60 * 1000) {
        return res.status(400).json({ success: false, message: 'Scheduled time must be at least 30 minutes in the future' });
      }
    }

    // ── Verify provider exists, approved, available ───
    const provider = await ServiceProvider.findById(providerId).populate('userId', 'isActive');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    if (!provider.userId?.isActive) {
      return res.status(400).json({ success: false, message: 'Provider account is inactive' });
    }
    if (provider.verificationStatus !== 'approved' || !provider.isVerified) {
      return res.status(400).json({ success: false, message: 'Provider is not verified yet' });
    }
    if (!provider.serviceCategories.includes(serviceCategory)) {
      return res.status(400).json({ success: false, message: 'Provider does not offer this service' });
    }
    if (!provider.isAvailable) {
      return res.status(400).json({ success: false, message: 'Provider is currently unavailable' });
    }

    if (bType === 'scheduled') {
      const day = getDayName(new Date(scheduledAt));
      const requestedStart = new Date(scheduledAt);
      const requestedEnd = new Date(requestedStart.getTime() + 60 * 60 * 1000);
      const matchingSlot = provider.availabilitySlots.find((slot) => {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        const requested = requestedStart.getHours() * 60 + requestedStart.getMinutes();
        return slot.day === day && start !== null && end !== null && start <= requested && end >= requested + 60;
      });
      if (!matchingSlot) {
        return res.status(400).json({ success: false, message: 'Provider is not available at the requested time' });
      }

      const conflict = await Booking.exists({
        providerId: provider._id,
        bookingType: 'scheduled',
        scheduledAt: { $lt: requestedEnd, $gte: new Date(requestedStart.getTime() - 60 * 60 * 1000) },
        status: { $nin: ['cancelled', 'rejected', 'completed'] },
      });
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Provider already has a booking during that time' });
      }
    }

    // ── Server-side price calculation (never trust client) ──
    const estimatedAmount = provider.pricing?.visitingCharge || 0;

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      serviceCategory,
      serviceDescription: serviceDescription.trim().slice(0, 1000),
      bookingType: bType,
      scheduledAt: bType === 'scheduled' ? new Date(scheduledAt) : null,
      serviceLocation: {
        address: serviceLocation.address.trim(),
        city: serviceLocation.city.trim(),
        area: serviceLocation.area?.trim() || '',
        pincode: serviceLocation.pincode?.trim() || '',
        landmark: serviceLocation.landmark?.trim() || '',
      },
      estimatedAmount,           // server-calculated only
      statusHistory: [{ previousStatus: null, status: 'pending', changedBy: req.user._id }],
    });

    const populated = await booking.populate([
      { path: 'customerId', select: 'name email phone' },
      { path: 'providerId', populate: { path: 'userId', select: 'name phone' } },
    ]);

    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my bookings (customer)
// @route  GET /api/bookings
// @access Private (customer)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const VALID_STATUSES = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'];
    const filter = { customerId: req.user._id };
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name phone avatar' } })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), bookings });
  } catch (error) {
    next(error);
  }
};

// @desc   Get booking by id
// @route  GET /api/bookings/:id
// @access Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name phone avatar' } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Authorization: customer owner, provider owner, or admin
    const isCustomer = booking.customerId?._id.toString() === req.user._id.toString();
    const providerUserId = booking.providerId?.userId?._id?.toString();
    const isProvider = providerUserId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc   Get provider's jobs
// @route  GET /api/bookings/provider
// @access Private (provider)
exports.getProviderBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const providerProfile = await ServiceProvider.findOne({ userId: req.user._id });
    if (!providerProfile) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const VALID_STATUSES = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'];
    const filter = { providerId: providerProfile._id };
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), bookings });
  } catch (error) {
    next(error);
  }
};

// @desc   Update booking status
// @route  PATCH /api/bookings/:id/status
// @access Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const providerProfile = await ServiceProvider.findOne({ userId: req.user._id });
    const isProvider = providerProfile && booking.providerId.toString() === providerProfile._id.toString();
    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    const role = isAdmin ? 'admin' : isProvider ? 'provider' : isCustomer ? 'customer' : null;
    if (!role) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Server-side transition validation
    const allowed = ALLOWED_TRANSITIONS[role]?.[booking.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: '${booking.status}' → '${status}' is not allowed for ${role}`,
      });
    }

    const previousStatus = booking.status;
    booking.status = status;
    booking.statusHistory.push({
      previousStatus,
      status,
      changedBy: req.user._id,
      note: note ? String(note).slice(0, 500) : '',
    });

    if (status === 'completed') {
      booking.completedAt = new Date();
      // Update provider earnings from server-calculated amount
      if (providerProfile) {
        const earned = booking.finalAmount > 0 ? booking.finalAmount : booking.estimatedAmount;
        providerProfile.totalEarnings += earned;
        providerProfile.completedJobs += 1;
        await providerProfile.save();
      }
    }

    if (status === 'cancelled') {
      booking.cancelledBy = role;
      booking.cancelReason = note ? String(note).slice(0, 500) : '';
    }

    await booking.save();
    res.json({ success: true, booking, previousStatus });
  } catch (error) {
    next(error);
  }
};

// @desc   Cancel booking (customer convenience route)
// @route  PATCH /api/bookings/:id/cancel
// @access Private (customer)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['pending', 'assigned'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a booking with status '${booking.status}'` });
    }

    const previousStatus = booking.status;
    booking.status = 'cancelled';
    booking.cancelledBy = 'customer';
    booking.cancelReason = reason ? String(reason).slice(0, 500) : '';
    booking.statusHistory.push({
      previousStatus,
      status: 'cancelled',
      changedBy: req.user._id,
      note: booking.cancelReason,
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: get all bookings
// @route  GET /api/admin/bookings
// @access Private (admin)
exports.adminGetBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, category, city } = req.query;

    const VALID_STATUSES = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'];
    const filter = {};
    if (status && VALID_STATUSES.includes(status)) filter.status = status;
    if (category) filter.serviceCategory = category;
    if (city) filter['serviceLocation.city'] = { $regex: city, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name phone' } })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), bookings });
  } catch (error) {
    next(error);
  }
};
