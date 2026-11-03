const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { escapeRegex } = require('../utils/helpers');
const fs = require('fs'); const path = require('path'); const upload = require('../middleware/upload');

exports.listUsers = asyncHandler(async (req, res) => {
  const f = { role: { $in: ['student', 'recruiter'] } };
  if (req.query.role) f.role = req.query.role;
  if (req.query.search) { const r = new RegExp(escapeRegex(req.query.search), 'i'); f.$or = [{ name: r }, { email: r }]; }
  const users = await User.find(f).sort({ createdAt: -1 }).limit(300);
  const recruiters = await RecruiterProfile.find({ user: { $in: users.map((u) => u._id) } }).populate('company', 'name');
  const cm = Object.fromEntries(recruiters.map((r) => [String(r.user), r.company?.name]));
  res.json({ users: users.map((u) => ({ ...u.toObject(), company: cm[String(u._id)] })) });
});

exports.toggleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') { res.status(404); throw new Error('User not found'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') { res.status(404); throw new Error('User not found'); }
  if (user.role === 'student') {
    const p = await StudentProfile.findOne({ user: user._id });
    if (p?.resume?.filename) fs.unlink(path.join(upload.dir, p.resume.filename), () => {});
    await Promise.all([StudentProfile.deleteOne({ user: user._id }), Application.deleteMany({ student: user._id }), SavedJob.deleteMany({ student: user._id })]);
  } else {
    const jobs = await Job.find({ recruiter: user._id }).select('_id');
    const ids = jobs.map((j) => j._id);
    await Promise.all([Application.deleteMany({ job: { $in: ids } }), SavedJob.deleteMany({ job: { $in: ids } }), Job.deleteMany({ recruiter: user._id }), RecruiterProfile.deleteOne({ user: user._id }), Company.deleteMany({ createdBy: user._id })]);
  }
  await Notification.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ message: 'User and related data deleted' });
});

exports.listJobs = asyncHandler(async (req, res) => {
  const f = {};
  if (req.query.search) f.title = new RegExp(escapeRegex(req.query.search), 'i');
  const jobs = await Job.find(f).populate('company', 'name').populate('recruiter', 'name').sort({ createdAt: -1 }).limit(300);
  const counts = await Application.aggregate([{ $group: { _id: '$job', n: { $sum: 1 } } }]);
  const m = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ jobs: jobs.map((j) => ({ ...j.toObject(), applicants: m[String(j._id)] || 0 })) });
});

exports.removeJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  await Promise.all([Application.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id })]);
  notify(job.recruiter, 'Job removed by admin', `Your posting "${job.title}" was removed by the administrator.`, 'warning');
  await job.deleteOne();
  res.json({ message: 'Job removed' });
});
