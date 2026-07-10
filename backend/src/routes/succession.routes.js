const router = require('express').Router();
const successionController = require('../controllers/succession.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/start', authenticate, successionController.startSuccession);
router.post('/:eventId/verify-death', authenticate, successionController.verifyDeath);
router.post('/:eventId/grant-access', authenticate, successionController.grantAccess);
router.get('/:id/status', authenticate, successionController.getSuccessionStatus);

module.exports = router;