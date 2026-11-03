const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/dashboardController');
router.get('/public', c.publicStats);
router.get('/student', protect, authorize('student'), c.student);
router.get('/recruiter', protect, authorize('recruiter'), c.recruiter);
router.get('/admin', protect, authorize('admin'), c.admin);
module.exports = router;
