const router = require('express').Router();
const ledgerController = require('../controllers/ledger.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, ledgerController.getUserLedger);
router.get('/stats', authenticate, ledgerController.getLedgerStats);
router.get('/all', authenticate, ledgerController.getAllLedger);
router.get('/verify/:uid', authenticate, ledgerController.verifyLedger);

module.exports = router;