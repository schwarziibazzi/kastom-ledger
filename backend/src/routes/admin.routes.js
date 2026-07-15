const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All admin routes require authentication
router.get('/stats', authenticate, adminController.getStats);
router.get('/activity', authenticate, adminController.getActivity);
router.get('/pending-reviews', authenticate, adminController.getPendingReviews);
router.get('/users', authenticate, adminController.getUsers);
router.get('/audit', authenticate, adminController.getAudit);
router.get('/reports', authenticate, adminController.getReports);

module.exports = router;