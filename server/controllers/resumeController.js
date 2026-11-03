const fs = require('fs');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/upload');

const removeFile = (name) => { if (name) fs.unlink(path.join(upload.dir, name), () => {}); };

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Select a PDF file to upload'); }
  const profile = await StudentProfile.findOne({ user: req.user._id });
  removeFile(profile.resume?.filename); // replacement
  profile.resume = { filename: req.file.filename, originalName: req.file.originalname, size: req.file.size, uploadedAt: new Date() };
  await profile.save();
  res.json({ resume: profile.resume });
});

const send = (res, profile) => {
  if (!profile?.resume?.filename) { res.status(404); throw new Error('No resume uploaded'); }
  const file = path.join(upload.dir, profile.resume.filename);
  if (!fs.existsSync(file)) { res.status(404); throw new Error('Resume file is missing on the server'); }
  res.download(file, profile.resume.originalName || 'resume.pdf');
};

exports.downloadMine = asyncHandler(async (req, res) => send(res, await StudentProfile.findOne({ user: req.user._id })));

exports.downloadForStudent = asyncHandler(async (req, res) => {
  if (req.user.role === 'recruiter') { // recruiters may only see applicants to their own jobs
    const jobIds = (await Job.find({ recruiter: req.user._id }).select('_id')).map((j) => j._id);
    const ok = await Application.exists({ student: req.params.studentId, job: { $in: jobIds } });
    if (!ok) { res.status(403); throw new Error('This student has not applied to your jobs'); }
  }
  send(res, await StudentProfile.findOne({ user: req.params.studentId }));
});

exports.deleteMine = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  removeFile(profile.resume?.filename);
  profile.resume = undefined;
  await profile.save();
  res.json({ message: 'Resume removed' });
});
