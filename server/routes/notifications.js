const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/miscController');
router.use(protect);
router.get('/', c.listNotifications);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markRead);
router.delete('/:id', c.removeNotification);
module.exports = router;
