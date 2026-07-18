const oidc4vpService = require('../services/oidc4vp.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initiate authentication (Third-party authorize)
exports.authorize = async (req, res) => {
  try {
    const { callback_url, state, nonce } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await oidc4vpService.generateQRCode(userId);

    res.json({
      qrCode: result.qrCode,
      sessionId: result.sessionId,
      state: result.state || state,
      nonce: result.nonce || nonce,
      callbackUrl: callback_url || oidc4vpService.callbackUrl
    });
  } catch (error) {
    console.error('Authorize error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate authentication',
      error: error.message
    });
  }
};

// Handle callback
exports.callback = async (req, res) => {
  try {
    const { vp_token, state, sessionId } = req.body;

    if (!vp_token || !state) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Find session by state
    const session = await oidc4vpService.getSessionByState(state);
    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state parameter'
      });
    }

    const result = await oidc4vpService.authenticateWithQR(session.sessionId, session.userId);

    res.json({
      success: true,
      sessionId: result.sessionId,
      accessToken: result.accessToken,
      redirect: result.redirect
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Check session status
exports.getSessionStatus = async (req, res) => {
  try {
    const { session } = req.query;

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    const status = await oidc4vpService.getSessionStatus(session);

    res.json(status);
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session status',
      error: error.message
    });
  }
};

// Get user info
exports.getUserInfo = async (req, res) => {
  try {
    const { session } = req.query;

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    const userInfo = await oidc4vpService.getUserInfo(session);

    res.json(userInfo);
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
      error: error.message
    });
  }
};

// Mock: Simulate wallet scanning (for demo)
exports.mockWalletScan = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and User ID required'
      });
    }

    const result = await oidc4vpService.authenticateWithQR(sessionId, userId);

    res.json({
      success: true,
      message: 'Wallet scan simulated successfully',
      sessionId: result.sessionId,
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    console.error('Mock wallet scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate wallet scan',
      error: error.message
    });
  }
};

// Get session by state (internal)
oidc4vpService.getSessionByState = function(state) {
  for (const [key, session] of this.sessions) {
    if (session.state === state) {
      return {
        sessionId: key,
        ...session
      };
    }
  }
  return null;
};