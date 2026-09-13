const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, metadata = {} }) => {
  if (!userId) return null;
  try {
    return await Notification.create({ userId, type, title, message, metadata });
  } catch (error) {
    console.warn('Optional notification delivery failed:', error.message);
    return null;
  }
};

module.exports = { createNotification };
