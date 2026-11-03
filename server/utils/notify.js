const Notification = require('../models/Notification');
module.exports = (user, title, message, type = 'info', link = '') =>
  Notification.create({ user, title, message, type, link }).catch(() => null);
