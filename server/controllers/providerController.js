const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const path = require('path');
const { createNotification } = require('../utils/notify');

const VALID_PROVIDER_DOCUMENT_TYPES = new Set([
  'identity',
  'identity_verification',
  'skill',
  'skill_certificate',
  'skill_verification',
]);

const normalizeDocumentType = (value) => {
  const raw = String(value || 'identity').toLowerCase().trim();
  return VALID_PROVIDER_DOCUMENT_TYPES.has(raw) ? raw : 'identity';
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc   Search / list providers
// @route  GET /api/providers
// @access Public
exports.getProviders = async (req, res, next) => {
  try {
    const { category, city, area, available, minRating, latitude, longitude, radiusKm = 25, page = 1, limit = 12 } = req.query;
    const validCategories = ['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid service category' });
    }
    const rating = minRating === undefined || minRating === '' ? null : Number(minRating);
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Invalid minimum rating' });
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    const radiusMeters = Math.min(100, Math.max(1, Number(radiusKm) || 25)) * 1000;

    const activeUsers = await User.find({ role: 'provider', isActive: true }).select('_id');
    const filter = { verificationStatus: 'approved', isVerified: true, userId: { $in: activeUsers.map((user) => user._id) } };
    if (category) filter.serviceCategories = category;
    if (city) filter['location.city'] = { $regex: escapeRegex(city.slice(0, 100)), $options: 'i' };
    if (area) filter['location.area'] = { $regex: escapeRegex(area.slice(0, 100)), $options: 'i' };
    if (available === 'true') filter.isAvailable = true;
    if (rating !== null) filter.rating = { $gte: rating };
    if (hasCoordinates) {
      filter['location.coordinates'] = {
        $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radiusMeters },
      };
    }

    const total = await ServiceProvider.countDocuments(filter);
    const providers = await ServiceProvider.find(filter)
      .populate('userId', 'name avatar')
      .sort(hasCoordinates ? {} : { rating: -1, completedJobs: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      nearby: hasCoordinates,
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
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const safeSlots = Array.isArray(availabilitySlots) ? availabilitySlots : [];
    const normalizedSlots = [];

    for (const slot of safeSlots) {
      if (!slot || typeof slot !== 'object') continue;

      if (!days.includes(slot.day)) {
        return res.status(400).json({ success: false, message: 'Invalid availability day' });
      }

      const startTime = typeof slot.startTime === 'string' ? slot.startTime.trim() : '';
      const endTime = typeof slot.endTime === 'string' ? slot.endTime.trim() : '';
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTime)) {
        return res.status(400).json({ success: false, message: 'Availability times must use HH:MM format' });
      }

      const startMinutes = Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);
      const endMinutes = Number(endTime.split(':')[0]) * 60 + Number(endTime.split(':')[1]);
      if (startMinutes >= endMinutes) {
        return res.status(400).json({ success: false, message: 'Availability start time must be earlier than end time' });
      }

      normalizedSlots.push({ day: slot.day, startTime, endTime });
    }

    const grouped = new Map();
    for (const slot of normalizedSlots) {
      const entries = grouped.get(slot.day) || [];
      entries.push({
        start: Number(slot.startTime.split(':')[0]) * 60 + Number(slot.startTime.split(':')[1]),
        end: Number(slot.endTime.split(':')[0]) * 60 + Number(slot.endTime.split(':')[1]),
      });
      grouped.set(slot.day, entries);
    }

    for (const [day, entries] of grouped.entries()) {
      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          const a = entries[i];
          const b = entries[j];
          if (a.start < b.end && b.start < a.end) {
            return res.status(400).json({ success: false, message: `Overlapping availability slots are not allowed for ${day}` });
          }
        }
      }
    }

    const provider = await ServiceProvider.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable, availabilitySlots: normalizedSlots },
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

    const allowedType = normalizeDocumentType(type);
    const hasRequestedType = provider.documents.some((doc) => normalizeDocumentType(doc.type) === allowedType);
    if (hasRequestedType) {
      return res.status(400).json({ success: false, message: 'A document of this type is already uploaded.' });
    }

    provider.documents.push({
      type: allowedType,
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

    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (status === 'approved') {
      const hasIdentityDoc = provider.documents.some((doc) => ['identity', 'identity_verification'].includes(String(doc.type || '').toLowerCase()));
      const hasSkillDoc = provider.documents.some((doc) => ['skill', 'skill_certificate', 'skill_verification'].includes(String(doc.type || '').toLowerCase()));
      const hasRequiredDocs = hasIdentityDoc && hasSkillDoc;
      if (!hasRequiredDocs && provider.verificationStatus !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Provider approval requires both identity and skill verification documents.',
        });
      }
    }

    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        isVerified: status === 'approved',
        verificationNote: note || '',
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedProvider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    await createNotification({
      userId: updatedProvider.userId?._id || updatedProvider.userId,
      type: `provider_${status}`,
      title: 'Verification status updated',
      message: `Your provider verification was ${status.replace('_', ' ')}.`,
      metadata: { providerId: updatedProvider._id, status },
    });

    res.json({ success: true, message: `Provider ${status}`, provider: updatedProvider });
  } catch (error) {
    next(error);
  }
};
