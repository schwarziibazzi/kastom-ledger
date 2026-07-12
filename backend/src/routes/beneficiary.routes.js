const router = require('express').Router();
const beneficiaryController = require('../controllers/beneficiary.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/estates', authenticate, beneficiaryController.getEstates);
router.get('/estates/:id', authenticate, beneficiaryController.getEstate);
router.get('/assets', authenticate, beneficiaryController.getAssets);
router.get('/documents', authenticate, beneficiaryController.getDocuments);
router.get('/messages', authenticate, beneficiaryController.getMessages);

module.exports = router;