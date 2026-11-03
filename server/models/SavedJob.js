const mongoose = require('mongoose');
const s = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
}, { timestamps: true });
s.index({ student: 1, job: 1 }, { unique: true });
module.exports = mongoose.model('SavedJob', s);
