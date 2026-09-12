const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { createNotification } = require('../utils/notify');

// @desc   Raise a dispute
// @route  POST /api/disputes
// @access Private (customer or provider)
exports.createDispute = async (req, res, next) => {
  try {
    const { bookingId, subject, description } = req.body;

    if (!bookingId || !subject || !description) {
      return res.status(400).json({ success: false, message: 'bookingId, subject and description are required' });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization: user must be customer OR provider associated with this booking
    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    let isProvider = false;
    if (req.user.role === 'provider') {
      const providerProfile = await ServiceProvider.findOne({ userId: req.user._id });
      isProvider = providerProfile && booking.providerId.toString() === providerProfile._id.toString();
    }
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to raise a dispute for this booking' });
    }

    // Dispute only valid for non-pending bookings that have started
    if (booking.status === 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot raise a dispute for a pending booking' });
    }

    // Check for duplicate open dispute on same booking by same user
    const existingDispute = await Dispute.findOne({
      bookingId,
      raisedBy: req.user._id,
      status: 'open',
    });
    if (existingDispute) {
      return res.status(409).json({ success: false, message: 'You already have an open dispute for this booking' });
    }

    const dispute = await Dispute.create({
      bookingId,
      raisedBy: req.user._id,
      raisedByRole: req.user.role,
      subject: subject.trim().slice(0, 200),
      description: description.trim().slice(0, 2000),
    });

    const populated = await dispute.populate('bookingId', 'serviceCategory serviceDescription status');

    await createNotification({
      userId: req.user._id,
      type: 'dispute_created',
      title: 'Dispute submitted',
      message: 'Your dispute was submitted for admin review.',
      metadata: { disputeId: dispute._id },
    });

    res.status(201).json({ success: true, dispute: populated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my disputes
// @route  GET /api/disputes/me
// @access Private
exports.getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user._id })
      .populate('bookingId', 'serviceCategory serviceDescription status createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (error) {
    next(error);
  }
};

// @desc   Get a single dispute
// @route  GET /api/disputes/:id
// @access Private
exports.getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('bookingId', 'serviceCategory serviceDescription status customerId providerId')
      .populate('raisedBy', 'name email role')
      .populate('resolvedBy', 'name email');

    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    await createNotification({
      userId: dispute.raisedBy,
      type: 'dispute_updated',
      title: 'Dispute updated',
      message: `Your dispute is now ${status.replace('_', ' ')}.`,
      metadata: { disputeId: dispute._id, status },
    });

    // Participants in the booking and admins can view the dispute.
    const isRaiser = dispute.raisedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const booking = dispute.bookingId;
    const isCustomer = booking.customerId?.toString() === req.user._id.toString();
    const providerProfile = req.user.role === 'provider'
      ? await ServiceProvider.findOne({ userId: req.user._id }).select('_id')
      : null;
    const isProvider = providerProfile && booking.providerId?.toString() === providerProfile._id.toString();

    if (!isRaiser && !isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, dispute });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: get all disputes
// @route  GET /api/admin/disputes
// @access Private (admin)
exports.adminGetDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && ['open', 'under_review', 'resolved', 'closed'].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const total = await Dispute.countDocuments(filter);

    const disputes = await Dispute.find(filter)
      .populate('raisedBy', 'name email role')
      .populate('bookingId', 'serviceCategory serviceDescription status')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), disputes });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: update dispute (resolve/close)
// @route  PATCH /api/admin/disputes/:id
// @access Private (admin)
exports.adminUpdateDispute = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const VALID_STATUSES = ['open', 'under_review', 'resolved', 'closed'];
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid dispute status' });
    }

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution: resolution ? String(resolution).slice(0, 2000) : undefined,
        resolvedBy: req.user._id,
        resolvedAt: ['resolved', 'closed'].includes(status) ? new Date() : undefined,
      },
      { new: true }
    ).populate('raisedBy', 'name email');

    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    res.json({ success: true, dispute });
  } catch (error) {
    next(error);
  }
};
