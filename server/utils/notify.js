const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, metadata = {} }) => {
  if (!userId) return null;
  return Notification.create({ userId, type, title, message, metadata });
};

module.exports = { createNotification };
