const router = require('express').Router();
const estateController = require('../controllers/estate.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, estateController.createEstate);
router.get('/', authenticate, estateController.getEstates);
router.get('/:id', authenticate, estateController.getEstate);
router.put('/:id', authenticate, estateController.updateEstate);
router.delete('/:id', authenticate, estateController.deleteEstate);
router.get('/:id/status', authenticate, estateController.getEstateStatus);

module.exports = router;