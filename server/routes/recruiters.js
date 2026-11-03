const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/profileController');
router.use(protect, authorize('recruiter'));
router.get('/profile', c.getRecruiterProfile);
router.put('/profile', c.updateRecruiterProfile);
module.exports = router;
