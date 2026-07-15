const router = require('express').Router();
const sevisDexController = require('../controllers/sevisDex.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/death-certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'death_cert_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// SevisWallet Authentication
router.post('/auth/wallet', sevisDexController.authenticateWallet);
router.get('/wallet/details', authenticate, sevisDexController.getWalletDetails);

// Asset Verification
router.post('/verify/land/:assetId', authenticate, sevisDexController.verifyLand);

// Death Registration
router.post('/register-death/:estateId', authenticate, upload.single('deathCertificate'), sevisDexController.registerDeath);

// Succession Transfer
router.post('/execute-succession/:estateId', authenticate, sevisDexController.executeSuccession);

// Status
router.get('/status/:estateId', authenticate, sevisDexController.getSevisDexStatus);

// Get SevisDEx requests
router.get('/requests', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.sevisDexRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests',
      error: error.message
    });
  }
});

module.exports = router;