const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/profileController');
router.use(protect);
router.get('/profile', authorize('student'), c.getStudentProfile);
router.put('/profile', authorize('student'), c.updateStudentProfile);
router.get('/:id', authorize('recruiter', 'admin'), c.getStudentById);
module.exports = router;
