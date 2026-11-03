const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');
const { computeMatch } = require('../utils/recommend');
const { monthsBack, fillMonths, startOfToday } = require('../utils/helpers');

const ym = { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } };
const statusDist = (rows) => Application.STATUSES.map((s) => ({ name: s, value: rows.find((r) => r._id === s)?.n || 0 }));

exports.publicStats = asyncHandler(async (req, res) => {
  const active = { isActive: true, deadline: { $gte: startOfToday() } };
  const [students, recruiters, jobs, companies, applications, cats] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'recruiter' }), Job.countDocuments(active),
    Company.countDocuments(), Application.countDocuments(),
    Job.aggregate([{ $match: active }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);
  res.json({ students, recruiters, jobs, companies, applications, categories: cats.map((c) => ({ name: c._id, count: c.count })) });
});

exports.student = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const profile = await StudentProfile.findOne({ user: uid });
  const [total, saved, grouped, history, jobs] = await Promise.all([
    Application.countDocuments({ student: uid }), SavedJob.countDocuments({ student: uid }),
    Application.aggregate([{ $match: { student: uid } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Application.aggregate([{ $match: { student: uid, createdAt: { $gte: monthsBack(6) } } }, { $group: { _id: ym, count: { $sum: 1 } } }]),
    Job.find({ isActive: true, deadline: { $gte: startOfToday() } }).populate('company', 'name location').sort({ createdAt: -1 }).limit(40)
  ]);
  const checks = [profile?.phone, profile?.headline, profile?.location, profile?.about, profile?.skills?.length, profile?.education?.length, profile?.experience?.length, profile?.resume?.filename];
  const dist = statusDist(grouped);
  const get = (n) => dist.find((d) => d.name === n).value;
  const recommended = jobs.map((j) => ({ job: j, match: computeMatch(profile, j) })).filter((x) => x.match.matchPercentage > 0)
    .sort((a, b) => b.match.matchPercentage - a.match.matchPercentage).slice(0, 4);
  res.json({
    totals: { applications: total, saved, shortlisted: get('Shortlisted'), pending: get('Applied') + get('Under Review') },
    profileCompletion: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    statusDistribution: dist, history: fillMonths(history, 6, 'count'),
    recommended, recent: jobs.slice(0, 4)
  });
});

exports.recruiter = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  const ids = jobs.map((j) => j._id);
  const [grouped, perJob, recent, jobsByMonth] = await Promise.all([
    Application.aggregate([{ $match: { job: { $in: ids } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Application.aggregate([{ $match: { job: { $in: ids } } }, { $group: { _id: '$job', n: { $sum: 1 } } }]),
    Application.find({ job: { $in: ids } }).populate('student', 'name').populate('job', 'title').sort({ createdAt: -1 }).limit(6),
    Job.aggregate([{ $match: { recruiter: req.user._id, createdAt: { $gte: monthsBack(6) } } }, { $group: { _id: ym, count: { $sum: 1 } } }])
  ]);
  const dist = statusDist(grouped);
  const pm = Object.fromEntries(perJob.map((p) => [String(p._id), p.n]));
  res.json({
    totals: { jobs: jobs.length, active: jobs.filter((j) => j.isActive && j.deadline >= startOfToday()).length,
      applicants: dist.reduce((a, b) => a + b.value, 0), shortlisted: dist.find((d) => d.name === 'Shortlisted').value },
    statusDistribution: dist,
    applicantsPerJob: jobs.slice(0, 8).map((j) => ({ name: j.title.length > 18 ? `${j.title.slice(0, 16)}…` : j.title, applicants: pm[String(j._id)] || 0 })),
    jobsByMonth: fillMonths(jobsByMonth, 6, 'count'), recent
  });
});

exports.admin = asyncHandler(async (req, res) => {
  const [students, recruiters, jobs, applications, growth, cats, grouped, ru, rj, ra] = await Promise.all([
    User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'recruiter' }), Job.countDocuments(), Application.countDocuments(),
    User.aggregate([{ $match: { role: { $ne: 'admin' }, createdAt: { $gte: monthsBack(6) } } }, { $group: { _id: { ...ym, k: '$role' }, count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Application.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5).select('name role createdAt'),
    Job.find().populate('company', 'name').sort({ createdAt: -1 }).limit(5),
    Application.find().populate('student', 'name').populate('job', 'title').sort({ createdAt: -1 }).limit(5)
  ]);
  const activities = [
    ...ru.map((u) => ({ text: `${u.name} registered as ${u.role}`, date: u.createdAt, type: 'user' })),
    ...rj.map((j) => ({ text: `${j.company?.name} posted "${j.title}"`, date: j.createdAt, type: 'job' })),
    ...ra.map((a) => ({ text: `${a.student?.name} applied for "${a.job?.title}"`, date: a.createdAt, type: 'application' }))
  ].sort((a, b) => b.date - a.date).slice(0, 10);
  res.json({
    totals: { students, recruiters, jobs, applications },
    userGrowth: fillMonths(growth, 6).map((r) => ({ month: r.month, students: r.student || 0, recruiters: r.recruiter || 0 })),
    jobsByCategory: cats.map((c) => ({ name: c._id, value: c.count })),
    statusDistribution: statusDist(grouped), activities
  });
});
