const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title: { type: String, required: [true, 'Job title is required'], trim: true, index: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: [true, 'Description is required'] },
  skills: { type: [String], default: [], index: true },
  location: { type: String, required: [true, 'Location is required'], trim: true, index: true },
  salaryMin: { type: Number, min: 0, default: 0 },   // in LPA (lakhs per annum)
  salaryMax: { type: Number, min: 0, default: 0 },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'], default: 'Full-time', index: true },
  experienceLevel: { type: String, enum: ['Entry Level', 'Junior', 'Mid Level', 'Senior'], default: 'Entry Level', index: true },
  category: { type: String, default: 'Software Development', index: true },
  vacancies: { type: Number, min: 1, default: 1 },
  deadline: { type: Date, required: [true, 'Deadline is required'], index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
s.index({ title: 'text', description: 'text', skills: 'text' });
module.exports = mongoose.model('Job', s);
