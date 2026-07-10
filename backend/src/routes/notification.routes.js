const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, notificationController.getNotifications);
router.get('/count', authenticate, notificationController.getNotificationCount);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;