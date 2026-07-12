const router = require('express').Router();
const willController = require('../controllers/will.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, willController.createWill);
router.get('/', authenticate, willController.getWills);
router.get('/:id', authenticate, willController.getWill);
router.put('/:id', authenticate, willController.updateWill);
router.delete('/:id', authenticate, willController.deleteWill);
router.post('/:id/submit', authenticate, willController.submitWill);
router.post('/:id/generate-pdf', authenticate, willController.generateWillPDF);
router.get('/:id/download-pdf', authenticate, willController.downloadWillPDF);

module.exports = router;