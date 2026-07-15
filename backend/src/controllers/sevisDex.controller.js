const { PrismaClient } = require('@prisma/client');
const sevisDexService = require('../services/sevisDex.service');
const sevisWalletService = require('../services/sevisWallet.service');
const prisma = new PrismaClient();

// Authenticate through SevisWallet
exports.authenticateWallet = async (req, res) => {
  try {
    const { authToken } = req.body;
    
    if (!authToken) {
      return res.status(400).json({
        success: false,
        message: 'SevisWallet authentication token required'
      });
    }

    const result = await sevisWalletService.authenticateWithSevisWallet(authToken);

    res.json({
      success: true,
      message: 'Authenticated through SevisWallet',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Wallet authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate with SevisWallet',
      error: error.message
    });
  }
};

// Verify land through SevisDEx
exports.verifyLand = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { titleNumber, owner, province } = req.body;
    const userId = req.user.id;

    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        estate: {
          ownerId: userId
        }
      },
      include: { estate: true }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or you do not have permission'
      });
    }

    const result = await sevisDexService.verifyLand(
      assetId,
      titleNumber || asset.titleNumber || asset.title,
      owner || asset.estate.owner.name,
      province || asset.location
    );

    res.json({
      success: true,
      message: result.verified ? 'Asset verified successfully through SevisDEx' : 'Asset verification failed',
      result
    });
  } catch (error) {
    console.error('Verify land error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify land',
      error: error.message
    });
  }
};

// Register death through SevisDEx
exports.registerDeath = async (req, res) => {
  try {
    const { estateId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Death certificate is required'
      });
    }

    const estate = await prisma.estate.findFirst({
      where: {
        id: estateId,
        OR: [
          { ownerId: userId },
          { executorId: userId },
          { beneficiaries: { some: { userId } } }
        ]
      }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    const result = await sevisDexService.processDeathRegistration(
      estateId,
      userId,
      {
        url: req.file.path,
        hash: req.file.hash || 'pending-hash'
      }
    );

    res.json({
      success: true,
      message: 'Death registered with Civil Registry and Public Curator notified',
      result
    });
  } catch (error) {
    console.error('Register death error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register death',
      error: error.message
    });
  }
};

// Execute succession transfer
exports.executeSuccession = async (req, res) => {
  try {
    const { estateId } = req.params;
    const { beneficiaryId } = req.body;
    const userId = req.user.id;

    const estate = await prisma.estate.findFirst({
      where: {
        id: estateId,
        ownerId: userId
      }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    const result = await sevisDexService.executeSuccessionTransfer(estateId, beneficiaryId);

    res.json({
      success: true,
      message: 'Succession transfer completed',
      result
    });
  } catch (error) {
    console.error('Execute succession error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute succession',
      error: error.message
    });
  }
};

// Get SevisDEx status for estate
exports.getSevisDexStatus = async (req, res) => {
  try {
    const { estateId } = req.params;
    const userId = req.user.id;

    const estate = await prisma.estate.findFirst({
      where: {
        id: estateId,
        OR: [
          { ownerId: userId },
          { executorId: userId },
          { beneficiaries: { some: { userId } } }
        ]
      },
      include: {
        sevisDexRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        deathVerifications: {
          orderBy: { requestedAt: 'desc' },
          take: 1
        },
        successionTransfers: {
          include: {
            fromUser: { select: { name: true, sevispassUid: true } },
            toUser: { select: { name: true, sevispassUid: true } }
          }
        }
      }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found'
      });
    }

    res.json({
      success: true,
      estate: {
        id: estate.id,
        title: estate.title,
        status: estate.status,
        sevisDexRequests: estate.sevisDexRequests,
        deathVerifications: estate.deathVerifications,
        successionTransfers: estate.successionTransfers
      }
    });
  } catch (error) {
    console.error('Get SevisDEx status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SevisDEx status',
      error: error.message
    });
  }
};

// Get wallet details
exports.getWalletDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await sevisWalletService.getWalletDetails(userId);

    res.json({
      success: true,
      wallet: result
    });
  } catch (error) {
    console.error('Get wallet details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet details',
      error: error.message
    });
  }
};

// Get wallet details
exports.getWalletDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        sevisWalletId: true,
        sevispassUid: true,
        name: true,
        province: true,
        lastSevisAuth: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      wallet: {
        walletId: user.sevisWalletId || 'SEVIS-WALLET-' + user.sevispassUid,
        sevispassUid: user.sevispassUid,
        name: user.name,
        province: user.province,
        lastAuth: user.lastSevisAuth
      }
    });
  } catch (error) {
    console.error('Get wallet details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet details',
      error: error.message
    });
  }
};