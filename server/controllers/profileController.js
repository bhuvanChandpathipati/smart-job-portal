const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');

// ---- students ----
exports.getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id }) || await StudentProfile.create({ user: req.user._id });
  res.json({ profile });
});
exports.updateStudentProfile = asyncHandler(async (req, res) => {
  const allowed = ['phone', 'headline', 'location', 'about', 'skills', 'educationLevel', 'experienceLevel', 'education', 'experience'];
  const update = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  if (update.skills) update.skills = [...new Set(update.skills.map((s) => String(s).trim()).filter(Boolean))];
  const profile = await StudentProfile.findOneAndUpdate({ user: req.user._id }, update, { new: true, runValidators: true, upsert: true });
  res.json({ profile });
});
exports.getStudentById = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.params.id }).populate('user', 'name email');
  if (!profile) { res.status(404); throw new Error('Student not found'); }
  res.json({ profile });
});

// ---- recruiters ----
exports.getRecruiterProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id }).populate('company');
  res.json({ profile });
});
exports.updateRecruiterProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({ user: req.user._id });
  const { designation, phone, company = {} } = req.body;
  if (designation !== undefined) profile.designation = designation;
  if (phone !== undefined) profile.phone = phone;
  await profile.save();
  const allowed = ['name', 'website', 'location', 'industry', 'size', 'description'];
  const upd = {};
  allowed.forEach((k) => { if (company[k] !== undefined) upd[k] = company[k]; });
  if (upd.name === '') { res.status(400); throw new Error('Company name is required'); }
  await Company.findByIdAndUpdate(profile.company, upd, { runValidators: true });
  res.json({ profile: await RecruiterProfile.findById(profile._id).populate('company') });
});
