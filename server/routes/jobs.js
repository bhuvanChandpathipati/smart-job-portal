const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const c = require('../controllers/jobController');

const rules = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('skills').isArray({ min: 1 }).withMessage('Add at least one required skill'),
  body('deadline').isISO8601().withMessage('A valid deadline is required'),
  body('salaryMax').custom((v, { req }) => Number(v || 0) >= Number(req.body.salaryMin || 0)).withMessage('Maximum salary must be at least the minimum')
];
router.get('/', c.listJobs);
router.get('/recommended', protect, authorize('student'), c.recommended);
router.get('/mine', protect, authorize('recruiter'), c.myJobs);
router.get('/:id', optionalAuth, c.getJob);
router.post('/', protect, authorize('recruiter'), rules, validate, c.createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), rules, validate, c.updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), c.deleteJob);
module.exports = router;
