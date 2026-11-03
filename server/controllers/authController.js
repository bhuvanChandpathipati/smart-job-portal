const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/helpers');

const safe = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, phone } = req.body;
  if (await User.findOne({ email: email.toLowerCase() })) { res.status(409); throw new Error('This email is already registered'); }
  const user = await User.create({ name, email, password, role });
  try {
    if (role === 'student') await StudentProfile.create({ user: user._id, phone });
    else {
      const company = await Company.create({ name: companyName, createdBy: user._id });
      await RecruiterProfile.create({ user: user._id, company: company._id, phone });
    }
  } catch (e) { await User.findByIdAndDelete(user._id); throw e; }
  res.status(201).json({ token: signToken(user._id), user: safe(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) { res.status(401); throw new Error('Incorrect email or password'); }
  if (!user.isActive) { res.status(403); throw new Error('Your account has been deactivated. Contact the administrator.'); }
  res.json({ token: signToken(user._id), user: safe(user) });
});

exports.me = asyncHandler(async (req, res) => res.json({ user: safe(req.user) }));

exports.updateMe = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  await req.user.save();
  res.json({ user: safe(req.user) });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) { res.status(400); throw new Error('Current password is incorrect'); }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});
