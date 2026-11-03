const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter'),
  body('companyName').if(body('role').equals('recruiter')).trim().notEmpty().withMessage('Company name is required for recruiters')
], validate, c.register);
router.post('/login', [body('email').isEmail().withMessage('Enter a valid email'), body('password').notEmpty().withMessage('Password is required')], validate, c.login);
router.get('/me', protect, c.me);
router.put('/me', protect, [body('name').trim().notEmpty().withMessage('Name is required')], validate, c.updateMe);
router.put('/password', protect, [body('currentPassword').notEmpty().withMessage('Current password is required'), body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')], validate, c.changePassword);
module.exports = router;
