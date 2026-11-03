const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const asyncHandler = require('../utils/asyncHandler');
const { computeMatch } = require('../utils/recommend');
const { escapeRegex: esc, startOfToday } = require('../utils/helpers');

const JOB_FIELDS = ['title', 'description', 'skills', 'location', 'salaryMin', 'salaryMax', 'jobType', 'experienceLevel', 'category', 'vacancies', 'deadline', 'isActive'];
const pick = (body) => { const o = {}; JOB_FIELDS.forEach((k) => { if (body[k] !== undefined) o[k] = body[k]; }); if (o.skills) o.skills = [...new Set(o.skills.map((s) => String(s).trim()).filter(Boolean))]; return o; };
const populateCompany = 'name location industry website description';

exports.listJobs = asyncHandler(async (req, res) => {
  const { q, title, company, location, skills, jobType, experienceLevel, category, minSalary, maxSalary } = req.query;
  const page = Math.max(1, +req.query.page || 1);
  const limit = Math.min(50, +req.query.limit || 9);
  const f = { isActive: true, deadline: { $gte: startOfToday() } };
  const and = [];
  if (q) {
    const r = new RegExp(esc(q), 'i');
    const cs = await Company.find({ name: r }).select('_id');
    and.push({ $or: [{ title: r }, { skills: r }, { category: r }, { company: { $in: cs.map((c) => c._id) } }] });
  }
  if (title) f.title = new RegExp(esc(title), 'i');
  if (company) { const cs = await Company.find({ name: new RegExp(esc(company), 'i') }).select('_id'); f.company = { $in: cs.map((c) => c._id) }; }
  if (location) f.location = new RegExp(esc(location), 'i');
  if (skills) {
    const list = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length) f.skills = { $in: list.map((s) => new RegExp(`^${esc(s)}$`, 'i')) };
  }
  if (jobType) f.jobType = jobType;
  if (experienceLevel) f.experienceLevel = experienceLevel;
  if (category) f.category = category;
  if (minSalary) and.push({ salaryMax: { $gte: +minSalary } });
  if (maxSalary) and.push({ salaryMin: { $lte: +maxSalary } });
  if (and.length) f.$and = and;
  const [jobs, total] = await Promise.all([
    Job.find(f).populate('company', populateCompany).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(f)
  ]);
  res.json({ jobs, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.recommended = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const jobs = await Job.find({ isActive: true, deadline: { $gte: startOfToday() } }).populate('company', populateCompany);
  const applied = new Set((await Application.find({ student: req.user._id }).select('job')).map((a) => String(a.job)));
  const list = jobs.map((j) => ({ job: j, match: computeMatch(profile, j), applied: applied.has(String(j._id)) }))
    .filter((x) => x.match.matchPercentage > 0)
    .sort((a, b) => b.match.matchPercentage - a.match.matchPercentage)
    .slice(0, 30);
  res.json({ recommendations: list, hasSkills: (profile?.skills || []).length > 0 });
});

exports.myJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).populate('company', 'name').sort({ createdAt: -1 });
  const counts = await Application.aggregate([{ $match: { job: { $in: jobs.map((j) => j._id) } } }, { $group: { _id: '$job', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json({ jobs: jobs.map((j) => ({ ...j.toObject(), applicants: map[String(j._id)] || 0 })) });
});

exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', populateCompany);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  const out = { job, expired: job.deadline < startOfToday() };
  if (req.user?.role === 'student') {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    out.match = computeMatch(profile, job);
    out.applied = !!(await Application.exists({ job: job._id, student: req.user._id }));
    out.saved = !!(await SavedJob.exists({ job: job._id, student: req.user._id }));
    out.hasResume = !!profile?.resume?.filename;
  }
  res.json(out);
});

exports.createJob = asyncHandler(async (req, res) => {
  const rp = await RecruiterProfile.findOne({ user: req.user._id });
  const job = await Job.create({ ...pick(req.body), company: rp.company, recruiter: req.user._id });
  res.status(201).json({ job });
});

const owned = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { res.status(404); throw new Error('Job not found'); }
  if (req.user.role !== 'admin' && String(job.recruiter) !== String(req.user._id)) { res.status(403); throw new Error('You can only manage your own jobs'); }
  return job;
};

exports.updateJob = asyncHandler(async (req, res) => {
  const job = await owned(req, res);
  Object.assign(job, pick(req.body));
  await job.save();
  res.json({ job });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await owned(req, res);
  await Promise.all([Application.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id }), job.deleteOne()]);
  res.json({ message: 'Job deleted' });
});
