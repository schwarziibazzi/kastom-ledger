const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/sevispass/login', authController.login);
router.post('/signup', authController.signup);
router.get('/profile', authenticate, authController.getProfile);
router.get('/mock-users', authController.getMockUsers);
router.get('/role', authenticate, authController.getUserRole);
router.put('/role', authenticate, authController.updateUserRole);
router.post('/logout', authenticate, authController.logout);

module.exports = router;