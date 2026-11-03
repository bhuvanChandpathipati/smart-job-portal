const jwt = require('jsonwebtoken');
exports.signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
exports.escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
exports.monthsBack = (n) => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() - (n - 1)); return d; };
// Turn [{_id:{y,m,k?}, count}] into one row per month for the last n months
exports.fillMonths = (rows, n = 6, defaultKey = 'count') => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const row = { month: d.toLocaleString('en-US', { month: 'short' }), [defaultKey]: 0 };
    rows.filter((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1)
      .forEach((r) => { row[r._id.k || defaultKey] = r.count; });
    out.push(row);
  }
  return out;
};
