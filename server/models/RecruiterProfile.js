const mongoose = require('mongoose');
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  designation: { type: String, trim: true, default: 'Recruiter' },
  phone: { type: String, trim: true, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('RecruiterProfile', s);
