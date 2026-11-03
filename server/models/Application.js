const mongoose = require('mongoose');
const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
const s = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: STATUSES, default: 'Applied', index: true },
  coverNote: { type: String, maxlength: 1000, default: '' },
  statusHistory: [{ status: String, date: { type: Date, default: Date.now } }]
}, { timestamps: true });
s.index({ job: 1, student: 1 }, { unique: true }); // blocks duplicate applications
s.statics.STATUSES = STATUSES;
module.exports = mongoose.model('Application', s);
