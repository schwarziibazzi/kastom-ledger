const router = require('express').Router();
const witnessController = require('../controllers/witness.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Make sure ALL controller functions exist
router.post('/request', authenticate, witnessController.requestWitness);
router.post('/:witnessId/approve', authenticate, witnessController.approveWitness);
router.get('/requests', authenticate, witnessController.getWitnessRequests);
router.get('/requests/:id', authenticate, witnessController.getWitnessRequest);
router.post('/:id/reject', authenticate, witnessController.rejectWitness);

module.exports = router;