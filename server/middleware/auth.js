const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) { res.status(401); throw new Error('Not authorized: please log in'); }
  let decoded;
  try { decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET); }
  catch { res.status(401); throw new Error('Session expired or invalid: please log in again'); }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) { res.status(401); throw new Error('Account not found or deactivated'); }
  req.user = user;
  next();
});

// Attaches req.user when a valid token is present, never blocks
exports.optionalAuth = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (h.startsWith('Bearer ')) {
      const d = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
      const u = await User.findById(d.id);
      if (u && u.isActive) req.user = u;
    }
  } catch { /* anonymous */ }
  next();
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) { res.status(403); return next(new Error('Access denied for your role')); }
  next();
};
