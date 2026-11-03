const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) { res.status(400); return next(new Error(e.array().map((x) => x.msg).join('. '))); }
  next();
};
