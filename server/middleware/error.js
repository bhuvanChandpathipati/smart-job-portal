exports.notFound = (req, res, next) => { res.status(404); next(new Error(`Route not found: ${req.originalUrl}`)); };
exports.errorHandler = (err, req, res, next) => { // eslint-disable-line
  let status = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Server error';
  if (err.code === 11000) { status = 409; message = `Duplicate value: ${Object.keys(err.keyValue || {}).join(', ') || 'record'} already exists`; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join('. '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Resume must be 2 MB or smaller' : err.message; }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
