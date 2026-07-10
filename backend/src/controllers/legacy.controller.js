const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const prisma = new PrismaClient();

exports.createLegacyProfile = async (req, res) => {
  try {
    const { title, description, culturalNotes } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    // Check if user already has a profile
    const existingProfile = await prisma.legacyProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'User already has a legacy profile'
      });
    }

    const profile = await prisma.legacyProfile.create({
      data: {
        userId,
        title,
        description,
        culturalNotes
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'LEGACY_PROFILE_CREATED',
      sevispassUid,
      {
        profileId: profile.id,
        title,
        timestamp: new Date().toISOString()
      }
    );

    res.status(201).json({
      success: true,
      message: 'Legacy profile created successfully',
      profile
    });
  } catch (error) {
    console.error('Create legacy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create legacy profile'
    });
  }
};

exports.getLegacyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await prisma.legacyProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            sevispassUid: true,
            province: true
          }
        },
        items: true,
        successors: {
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

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Legacy profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get legacy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legacy profile'
    });
  }
};

exports.addLegacyItem = async (req, res) => {
  try {
    const { category, title, description, visibility } = req.body;
    const ownerUid = req.user.sevispassUid;
    const userId = req.user.id;

    // Get user's profile
    const profile = await prisma.legacyProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Legacy profile not found. Please create one first.'
      });
    }

    const item = await prisma.legacyItem.create({
      data: {
        ownerUid,
        profileId: profile.id,
        category,
        title,
        description,
        visibility: visibility || 'private'
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'LEGACY_ITEM_ADDED',
      ownerUid,
      {
        itemId: item.id,
        category,
        title,
        timestamp: new Date().toISOString()
      }
    );

    res.status(201).json({
      success: true,
      message: 'Legacy item added successfully',
      item
    });
  } catch (error) {
    console.error('Add legacy item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add legacy item'
    });
  }
};

exports.getLegacyItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const profile = await prisma.legacyProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Legacy profile not found'
      });
    }

    const where = { profileId: profile.id };
    if (category) {
      where.category = category;
    }

    const items = await prisma.legacyItem.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Get legacy items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legacy items'
    });
  }
};

exports.updateLegacyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, culturalNotes } = req.body;
    const userId = req.user.id;

    const profile = await prisma.legacyProfile.findFirst({
      where: { id, userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Legacy profile not found or you do not have permission'
      });
    }

    const updatedProfile = await prisma.legacyProfile.update({
      where: { id },
      data: {
        title,
        description,
        culturalNotes
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'LEGACY_PROFILE_UPDATED',
      req.user.sevispassUid,
      {
        profileId: id,
        changes: { title, description, culturalNotes },
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: 'Legacy profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update legacy profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update legacy profile'
    });
  }
};