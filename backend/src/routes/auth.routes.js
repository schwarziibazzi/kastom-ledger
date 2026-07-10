const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/sevispass/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/mock-users', authController.getMockUsers);
router.get('/role', authenticate, authController.getUserRole);  // ← ADD THIS
router.post('/logout', authenticate, authController.logout);

module.exports = router;