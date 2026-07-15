const router = require('express').Router();
const sevisWalletController = require('../controllers/sevisWallet.controller');
const sevisDexController = require('../controllers/sevisDex.controller');
const { authenticate } = require('../middleware/auth.middleware');

// SevisWallet Routes
router.post('/wallet/init', authenticate, sevisWalletController.initializeWallet);
router.get('/wallet', authenticate, sevisWalletController.getWalletContents);

// Peer-to-Peer Data Routes
router.post('/data/request', authenticate, sevisWalletController.requestPeerData);
router.post('/data/respond/:requestId', authenticate, sevisWalletController.respondToPeerData);
router.get('/requests', authenticate, sevisWalletController.getPeerRequests);

// SevisDEx Routes (Asset Verification)
router.post('/verify/land/:assetId', authenticate, sevisDexController.verifyLand);
router.get('/status/:estateId', authenticate, sevisDexController.getSevisDexStatus);

module.exports = router;