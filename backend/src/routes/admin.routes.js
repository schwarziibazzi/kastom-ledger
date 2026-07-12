const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/users', authenticate, adminController.getUsers);
router.get('/stats', authenticate, adminController.getUserStats);

module.exports = router;