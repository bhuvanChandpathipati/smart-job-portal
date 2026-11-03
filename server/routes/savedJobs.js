const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/miscController');
router.use(protect, authorize('student'));
router.get('/', c.listSaved);
router.post('/:jobId', c.saveJob);
router.delete('/:jobId', c.unsaveJob);
module.exports = router;
