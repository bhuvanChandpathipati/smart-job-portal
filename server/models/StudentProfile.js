const mongoose = require('mongoose');
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String, trim: true, default: '' },
  headline: { type: String, trim: true, maxlength: 120, default: '' },
  location: { type: String, trim: true, default: '' },
  about: { type: String, maxlength: 1000, default: '' },
  skills: { type: [String], default: [], index: true },
  educationLevel: { type: String, enum: ['Diploma', 'Bachelor', 'Master', 'PhD'], default: 'Bachelor' },
  experienceLevel: { type: String, enum: ['Entry Level', 'Junior', 'Mid Level', 'Senior'], default: 'Entry Level' },
  education: [{ institution: String, degree: String, field: String, year: String, grade: String }],
  experience: [{ company: String, role: String, duration: String, description: String }],
  resume: { filename: String, originalName: String, size: Number, uploadedAt: Date }
}, { timestamps: true });
module.exports = mongoose.model('StudentProfile', s);
