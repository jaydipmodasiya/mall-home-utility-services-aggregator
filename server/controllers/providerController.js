const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const path = require('path');

// @desc   Search / list providers
// @route  GET /api/providers
// @access Public
exports.getProviders = async (req, res, next) => {
  try {
    const { category, city, area, available, minRating, page = 1, limit = 12 } = req.query;

    const activeUsers = await User.find({ role: 'provider', isActive: true }).select('_id');
    const filter = { verificationStatus: 'approved', isVerified: true, userId: { $in: activeUsers.map((user) => user._id) } };
    if (category) filter.serviceCategories = category;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (area) filter['location.area'] = { $regex: area, $options: 'i' };
    if (available === 'true') filter.isAvailable = true;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const total = await ServiceProvider.countDocuments(filter);
    const providers = await ServiceProvider.find(filter)
      .populate('userId', 'name avatar')
      .sort({ rating: -1, completedJobs: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single provider
// @route  GET /api/providers/:id
// @access Public
exports.getProvider = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({
      _id: req.params.id,
      verificationStatus: 'approved',
      isVerified: true,
    }).populate(
      'userId',
      'name avatar createdAt isActive'
    );
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    if (!provider.userId?.isActive) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const safeProvider = provider.toObject();
    delete safeProvider.documents;
    delete safeProvider.verificationNote;
    delete safeProvider.userId?.email;
    delete safeProvider.userId?.phone;

    res.json({ success: true, provider: safeProvider });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my provider profile
// @route  GET /api/providers/me
// @access Private (provider)
exports.getMyProfile = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone avatar'
    );
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc   Update provider profile
// @route  PATCH /api/providers/me
// @access Private (provider)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const { bio, serviceCategories, skills, experience, pricing, location } = req.body;

    const provider = await ServiceProvider.findOneAndUpdate(
      { userId: req.user._id },
      { bio, serviceCategories, skills, experience, pricing, location },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc   Update availability
// @route  PATCH /api/providers/me/availability
// @access Private (provider)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable, availabilitySlots } = req.body;

    const provider = await ServiceProvider.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable, availabilitySlots },
      { new: true }
    );

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc   Upload verification document
// @route  POST /api/providers/me/documents
// @access Private (provider)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { type } = req.body;
    const provider = await ServiceProvider.findOne({ userId: req.user._id });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    provider.documents.push({
      type: type || 'identity',
      filename: req.file.filename,
      originalName: req.file.originalname,
    });

    // Mark as pending review when docs uploaded
    if (provider.verificationStatus === 'pending') {
      provider.verificationStatus = 'under_review';
    }

    await provider.save();

    res.json({ success: true, message: 'Document uploaded successfully', provider });
  } catch (error) {
    next(error);
  }
};

// ===================== ADMIN =====================

// @desc   Admin: list all providers (with filters)
// @route  GET /api/admin/providers
// @access Private (admin)
exports.adminGetProviders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;

    const total = await ServiceProvider.countDocuments(filter);
    const providers = await ServiceProvider.find(filter)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, providers });
  } catch (error) {
    next(error);
  }
};

// @desc   Admin: verify/approve/reject provider
// @route  PATCH /api/admin/providers/:id/verify
// @access Private (admin)
exports.adminVerifyProvider = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        isVerified: status === 'approved',
        verificationNote: note || '',
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({ success: true, message: `Provider ${status}`, provider });
  } catch (error) {
    next(error);
  }
};
