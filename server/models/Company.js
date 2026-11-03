const mongoose = require('mongoose');
const s = new mongoose.Schema({
  name: { type: String, required: [true, 'Company name is required'], trim: true, index: true },
  website: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  industry: { type: String, trim: true, default: '' },
  size: { type: String, default: '' },
  description: { type: String, maxlength: 1500, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Company', s);
