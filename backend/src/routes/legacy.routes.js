const router = require('express').Router();
const legacyController = require('../controllers/legacy.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/profile', authenticate, legacyController.createLegacyProfile);
router.get('/profile/:id', authenticate, legacyController.getLegacyProfile);
router.put('/profile/:id', authenticate, legacyController.updateLegacyProfile);
router.post('/items', authenticate, legacyController.addLegacyItem);
router.get('/items', authenticate, legacyController.getLegacyItems);

module.exports = router;