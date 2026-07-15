const router = require('express').Router();
const integrationController = require('../controllers/integration.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Admin routes
router.get('/', authenticate, integrationController.getIntegrations);
router.post('/:id/test', authenticate, integrationController.testConnection);
router.post('/:id/sync', authenticate, integrationController.syncIntegration);
router.get('/:id/logs', authenticate, integrationController.getSyncLogs);
router.put('/:id/config', authenticate, integrationController.updateConfiguration);
router.get('/stats', authenticate, integrationController.getIntegrationStats);
router.get('/health', authenticate, integrationController.getHealthDashboard);

// User routes
router.post('/user/:integrationId/connect', authenticate, integrationController.connectUserIntegration);
router.post('/user/:integrationId/import', authenticate, integrationController.importAssets);
router.get('/user/services', authenticate, integrationController.getUserConnectedServices);

module.exports = router;