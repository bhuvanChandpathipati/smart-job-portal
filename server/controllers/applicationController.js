const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { computeMatch } = require('../utils/recommend');
const { startOfToday } = require('../utils/helpers');

exports.apply = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.body.jobId).populate('company', 'name');
  if (!job || !job.isActive) { res.status(404); throw new Error('This job is no longer available'); }
  if (job.deadline < startOfToday()) { res.status(400); throw new Error('The application deadline has passed'); }
  if (await Application.exists({ job: job._id, student: req.user._id })) { res.status(409); throw new Error('You have already applied for this job'); }
  const app = await Application.create({ job: job._id, student: req.user._id, coverNote: req.body.coverNote || '', statusHistory: [{ status: 'Applied' }] });
  notify(req.user._id, 'Application submitted', `You applied for ${job.title} at ${job.company.name}.`, 'success', `/student/applications/${app._id}`);
  notify(job.recruiter, 'New applicant', `${req.user.name} applied for ${job.title}.`, 'application', `/recruiter/applicants/${app._id}`);
  res.status(201).json({ application: app });
});

exports.mine = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate({ path: 'job', select: 'title location jobType company', populate: { path: 'company', select: 'name' } }).sort({ createdAt: -1 });
  res.json({ applications });
});

exports.getOne = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id).populate('student', 'name email')
    .populate({ path: 'job', populate: { path: 'company', select: 'name location' } });
  if (!app) { res.status(404); throw new Error('Application not found'); }
  const isStudent = String(app.student._id) === String(req.user._id);
  const isOwner = req.user.role === 'recruiter' && String(app.job.recruiter) === String(req.user._id);
  if (!isStudent && !isOwner && req.user.role !== 'admin') { res.status(403); throw new Error('Not allowed to view this application'); }
  const profile = await StudentProfile.findOne({ user: app.student._id });
  res.json({ application: app, profile: req.user.role === 'student' ? undefined : profile, match: computeMatch(profile, app.job) });
});

exports.recruiterList = asyncHandler(async (req, res) => {
  const { search, status, jobId } = req.query;
  const jobs = await Job.find({ recruiter: req.user._id }).select('_id title');
  const f = { job: { $in: jobs.map((j) => j._id) } };
  if (jobId) f.job = jobs.find((j) => String(j._id) === jobId)?._id || null;
  if (status) f.status = status;
  let apps = await Application.find(f).populate('student', 'name email').populate('job', 'title skills experienceLevel jobType').sort({ createdAt: -1 });
  const profiles = await StudentProfile.find({ user: { $in: apps.map((a) => a.student._id) } });
  const pm = Object.fromEntries(profiles.map((p) => [String(p.user), p]));
  let rows = apps.map((a) => {
    const p = pm[String(a.student._id)];
    return { ...a.toObject(), profile: p ? { headline: p.headline, skills: p.skills, location: p.location, hasResume: !!p.resume?.filename } : null, match: computeMatch(p, a.job).matchPercentage };
  });
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => r.student.name.toLowerCase().includes(s) || r.student.email.toLowerCase().includes(s) || (r.profile?.skills || []).some((k) => k.toLowerCase().includes(s)));
  }
  res.json({ applications: rows, jobs });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id).populate('job', 'title recruiter');
  if (!app) { res.status(404); throw new Error('Application not found'); }
  if (req.user.role !== 'admin' && String(app.job.recruiter) !== String(req.user._id)) { res.status(403); throw new Error('Not your applicant'); }
  const { status } = req.body;
  if (app.status !== status) {
    app.status = status;
    app.statusHistory.push({ status });
    await app.save();
    notify(app.student, 'Application update', `Your application for ${app.job.title} is now "${status}".`, status === 'Rejected' ? 'warning' : 'success', `/student/applications/${app._id}`);
  }
  res.json({ application: app });
});

exports.adminList = asyncHandler(async (req, res) => {
  const f = req.query.status ? { status: req.query.status } : {};
  const applications = await Application.find(f).populate('student', 'name email')
    .populate({ path: 'job', select: 'title company', populate: { path: 'company', select: 'name' } }).sort({ createdAt: -1 }).limit(300);
  res.json({ applications });
});

exports.remove = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) { res.status(404); throw new Error('Application not found'); }
  await app.deleteOne();
  res.json({ message: 'Application deleted' });
});
