const router = require('express').Router();
const beneficiariesController = require('../controllers/beneficiaries.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, beneficiariesController.createBeneficiary);
router.get('/', authenticate, beneficiariesController.getBeneficiaries);
router.get('/:id', authenticate, beneficiariesController.getBeneficiary);
router.put('/:id', authenticate, beneficiariesController.updateBeneficiary);
router.delete('/:id', authenticate, beneficiariesController.deleteBeneficiary);

module.exports = router;