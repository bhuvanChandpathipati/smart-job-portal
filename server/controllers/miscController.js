const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// ---- saved jobs ----
exports.listSaved = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ student: req.user._id }).populate({ path: 'job', populate: { path: 'company', select: 'name location' } }).sort({ createdAt: -1 });
  res.json({ saved: saved.filter((s) => s.job), ids: saved.filter((s) => s.job).map((s) => String(s.job._id)) });
});
exports.saveJob = asyncHandler(async (req, res) => {
  if (!(await Job.exists({ _id: req.params.jobId }))) { res.status(404); throw new Error('Job not found'); }
  await SavedJob.updateOne({ student: req.user._id, job: req.params.jobId }, { $setOnInsert: {} }, { upsert: true });
  res.status(201).json({ message: 'Job saved' });
});
exports.unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.deleteOne({ student: req.user._id, job: req.params.jobId });
  res.json({ message: 'Job removed from saved' });
});

// ---- notifications ----
exports.listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ notifications, unread: notifications.filter((n) => !n.isRead).length });
});
exports.markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.json({ message: 'Marked as read' });
});
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All marked as read' });
});
exports.removeNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});
