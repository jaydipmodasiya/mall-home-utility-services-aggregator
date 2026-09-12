const ProviderDiscovery = require('../models/ProviderDiscovery');

exports.recordProviderDiscovery = async (req, res, next) => {
  try {
    const { sessionId, category = '', city = '' } = req.body;
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 120) {
      return res.status(400).json({ success: false, message: 'A valid session id is required' });
    }
    await ProviderDiscovery.create({
      sessionId: sessionId.trim(),
      userId: req.user?._id || null,
      category: String(category).trim().slice(0, 50),
      city: String(city).trim().slice(0, 100),
    });
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};
