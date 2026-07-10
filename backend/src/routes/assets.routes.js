const router = require('express').Router();
const assetsController = require('../controllers/assets.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, assetsController.createAsset);
router.get('/', authenticate, assetsController.getAssets);
router.get('/:id', authenticate, assetsController.getAsset);
router.put('/:id', authenticate, assetsController.updateAsset);
router.delete('/:id', authenticate, assetsController.deleteAsset);

module.exports = router;