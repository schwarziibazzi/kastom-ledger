const sevispassService = require('../services/sevispass.service');
const ledgerService = require('../services/ledger.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { sevispassUid } = req.body;
    
    if (!sevispassUid) {
      return res.status(400).json({
        success: false,
        message: 'SevisPass UID is required'
      });
    }

    const result = await sevispassService.login(sevispassUid);
    
    // Log to ledger
    await ledgerService.createEntry(
      'USER_LOGIN',
      result.user.sevispassUid,
      {
        user: result.user.name,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        legacyProfile: true,
        successorNominations: {
          include: {
            successor: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        }
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
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

exports.getUserRole = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    res.json({
      success: true,
      role: user?.role || 'OWNER'
    });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user role'
    });
  }
};

exports.getMockUsers = async (req, res) => {
  try {
    const mockUsers = sevispassService.getMockUsers();
    res.json({
      success: true,
      users: mockUsers
    });
  } catch (error) {
    console.error('Get mock users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mock users'
    });
  }
};

exports.logout = async (req, res) => {
  // In a real application, you might want to invalidate the token
  // For now, we just respond with success
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};