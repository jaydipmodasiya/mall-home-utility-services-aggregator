const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const normalizeProviderLocation = (location) => {
  if (location === undefined || location === null) return undefined;
  if (typeof location !== 'object' || Array.isArray(location)) {
    return { error: 'Provider location must be an object' };
  }

  const normalized = { ...location };
  if (location.coordinates === undefined || location.coordinates === null) {
    delete normalized.coordinates;
    return { location: normalized };
  }

  const values = location.coordinates.coordinates;
  const valid = location.coordinates.type === 'Point'
    && Array.isArray(values)
    && values.length === 2
    && Number.isFinite(Number(values[0]))
    && Number.isFinite(Number(values[1]))
    && Number(values[0]) >= -180
    && Number(values[0]) <= 180
    && Number(values[1]) >= -90
    && Number(values[1]) <= 90;
  if (!valid) return { error: 'Location coordinates must be a valid GeoJSON Point [longitude, latitude]' };

  normalized.coordinates = {
    type: 'Point',
    coordinates: [Number(values[0]), Number(values[1])],
  };
  return { location: normalized };
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Role whitelist — admin can only be set via database; never via API
    const requestedRole = req.body.role;
    const ALLOWED_ROLES = ['customer', 'provider'];
    const role = ALLOWED_ROLES.includes(requestedRole) ? requestedRole : 'customer';
    const providerLocation = role === 'provider' ? normalizeProviderLocation(location) : undefined;
    if (providerLocation?.error) {
      return res.status(400).json({ success: false, message: providerLocation.error });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name: name.trim().slice(0, 100),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone?.trim() || '',
    });

    // Create provider profile if role is provider
    if (user.role === 'provider') {
      await ServiceProvider.create({ userId: user._id, ...(providerLocation?.location ? { location: providerLocation.location } : {}) });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ userId: user._id });
    }
    res.json({ success: true, user, providerProfile });
  } catch (error) {
    next(error);
  }
};

// @desc   Update current user profile
// @route  PATCH /api/auth/me
// @access Private
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PATCH /api/auth/change-password
// @access Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
