const { PrismaClient } = require('@prisma/client');
const sevisWalletService = require('../services/sevisWallet.service');
const prisma = new PrismaClient();

// Initialize SevisWallet
exports.initializeWallet = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user.id;

    const result = await sevisWalletService.initializeWallet(userId, phoneNumber);

    res.json({
      success: true,
      message: 'SevisWallet initialized successfully',
      result
    });
  } catch (error) {
    console.error('Initialize wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize wallet',
      error: error.message
    });
  }
};

// Get wallet contents
exports.getWalletContents = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sevisWalletService.getWalletContents(userId);

    res.json({
      success: true,
      wallet: result
    });
  } catch (error) {
    console.error('Get wallet contents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet contents',
      error: error.message
    });
  }
};

// Request peer data (P2P)
exports.requestPeerData = async (req, res) => {
  try {
    const { responderId, requestType, requestData } = req.body;
    const requesterId = req.user.id;

    const result = await sevisWalletService.requestPeerData(
      requesterId,
      responderId,
      requestType,
      requestData
    );

    res.json({
      success: true,
      message: 'Data request sent',
      request: result
    });
  } catch (error) {
    console.error('Request peer data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request data',
      error: error.message
    });
  }
};

// Respond to peer data request
exports.respondToPeerData = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approved, responseData } = req.body;
    const userId = req.user.id;

    const result = await sevisWalletService.respondToPeerData(
      requestId,
      userId,
      approved,
      responseData
    );

    res.json({
      success: true,
      message: approved ? 'Data request approved' : 'Data request rejected',
      request: result
    });
  } catch (error) {
    console.error('Respond to peer data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to request',
      error: error.message
    });
  }
};

// Get peer data requests
exports.getPeerRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await prisma.peerDataRequest.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { responderId: userId }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            sevispassUid: true,
            sevisDid: true
          }
        },
        responder: {
          select: {
            id: true,
            name: true,
            sevispassUid: true,
            sevisDid: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get peer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests',
      error: error.message
    });
  }
};