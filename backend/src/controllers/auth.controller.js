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
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        sevispassUid: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role'
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { sevispassUid, name, dateOfBirth, province, phone, occupation, role, profilePhoto } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { sevispassUid }
    });

    if (user) {
      // Update the user's role if they already exist
      user = await prisma.user.update({
        where: { sevispassUid },
        data: {
          name: name || user.name,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth,
          province: province || user.province,
          phone: phone || user.phone,
          occupation: occupation || user.occupation,
          profilePhoto: profilePhoto || user.profilePhoto,
          role: role || user.role,
          verificationStatus: 'verified'
        }
      });

      // Log to ledger
      await ledgerService.createEntry(
        'USER_SIGNUP',
        sevispassUid,
        {
          user: user.name,
          role: user.role,
          timestamp: new Date().toISOString()
        }
      );

      // Generate token
      const token = sevispassService.generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user,
        token
      });
    }

    // Create new user with role
    user = await prisma.user.create({
      data: {
        sevispassUid,
        name: name || 'New User',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
        province: province || 'National Capital District',
        phone: phone || null,
        occupation: occupation || null,
        profilePhoto: profilePhoto || null,
        role: role || 'OWNER',
        verificationStatus: 'verified'
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'USER_SIGNUP',
      sevispassUid,
      {
        user: user.name,
        role: user.role,
        timestamp: new Date().toISOString()
      }
    );

    // Generate token
    const token = sevispassService.generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};