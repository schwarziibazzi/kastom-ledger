const router = require('express').Router();
const successorController = require('../controllers/successor.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, successorController.nominateSuccessor);
router.get('/', authenticate, successorController.getSuccessors);
router.get('/pending', authenticate, successorController.getPendingWitnessRequests);
router.put('/:id/status', authenticate, successorController.updateSuccessorStatus);

module.exports = router;