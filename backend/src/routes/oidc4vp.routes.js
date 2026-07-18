const router = require('express').Router();
const oidc4vpController = require('../controllers/oidc4vp.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Third-party authorize (can be public or authenticated depending on use case)
router.post('/authorize', oidc4vpController.authorize);

// Callback endpoint
router.post('/callback', oidc4vpController.callback);

// Session status
router.get('/session/status', oidc4vpController.getSessionStatus);

// User info
router.get('/user', oidc4vpController.getUserInfo);

// Mock wallet scan (for demo purposes)
router.post('/mock-wallet-scan', authenticate, oidc4vpController.mockWalletScan);

module.exports = router;