const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const prisma = new PrismaClient();

exports.createAsset = async (req, res) => {
  try {
    const { estateId, type, title, description, estimatedValue, location } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    // Check if user owns the estate
    const estate = await prisma.estate.findFirst({
      where: { id: estateId, ownerId: userId }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    const asset = await prisma.asset.create({
      data: {
        estateId,
        type,
        title,
        description,
        estimatedValue: parseFloat(estimatedValue) || null,
        location
      }
    });

    await ledgerService.createEntry(
      'ASSET_ADDED',
      sevispassUid,
      {
        estateId,
        assetId: asset.id,
        title: asset.title
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Asset Added',
      `Asset "${asset.title}" has been added to your estate.`,
      `/estate/${estateId}`,
      estateId
    );

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset'
    });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const userId = req.user.id;

    const assets = await prisma.asset.findMany({
      where: {
        estate: {
          ownerId: userId
        }
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        },
        documents: true,
        beneficiary: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      assets
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets'
    });
  }
};

exports.getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        },
        documents: true,
        beneficiary: {
          include: {
            user: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset'
    });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, estimatedValue, location, status } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.asset.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or you do not have permission'
      });
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        type: type || existing.type,
        title: title || existing.title,
        description: description || existing.description,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : existing.estimatedValue,
        location: location || existing.location,
        status: status || existing.status
      }
    });

    await ledgerService.createEntry(
      'ASSET_UPDATED',
      sevispassUid,
      {
        assetId: asset.id,
        title: asset.title
      }
    );

    res.json({
      success: true,
      message: 'Asset updated successfully',
      asset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset'
    });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.asset.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or you do not have permission'
      });
    }

    await prisma.asset.delete({
      where: { id }
    });

    await ledgerService.createEntry(
      'ASSET_DELETED',
      sevispassUid,
      {
        assetId: id,
        title: existing.title
      }
    );

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset'
    });
  }
};