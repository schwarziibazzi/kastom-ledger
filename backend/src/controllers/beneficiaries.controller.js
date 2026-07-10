const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const prisma = new PrismaClient();

exports.createBeneficiary = async (req, res) => {
  try {
    const { estateId, userId, relationship, sharePercentage } = req.body;
    const ownerId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    // Check if user owns the estate
    const estate = await prisma.estate.findFirst({
      where: { id: estateId, ownerId }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    // Check if beneficiary exists
    const beneficiaryUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!beneficiaryUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a beneficiary
    const existing = await prisma.beneficiary.findFirst({
      where: {
        estateId,
        userId
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User is already a beneficiary'
      });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        estateId,
        userId,
        relationship,
        sharePercentage: parseFloat(sharePercentage) || null
      }
    });

    await ledgerService.createEntry(
      'BENEFICIARY_ADDED',
      sevispassUid,
      {
        estateId,
        beneficiaryId: beneficiary.id,
        userId
      }
    );

    await notificationService.createNotification(
      userId,
      'BENEFICIARY_ACCEPTED',
      'Beneficiary Invitation',
      `You have been added as a beneficiary to "${estate.title}".`,
      `/beneficiary/estate/${estateId}`,
      estateId
    );

    res.status(201).json({
      success: true,
      message: 'Beneficiary added successfully',
      beneficiary
    });
  } catch (error) {
    console.error('Create beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add beneficiary',
      error: error.message
    });
  }
};

exports.getBeneficiaries = async (req, res) => {
  try {
    const userId = req.user.id;

    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        estate: {
          ownerId: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            sevispassUid: true,
            profilePhoto: true,
            province: true
          }
        },
        estate: {
          select: {
            id: true,
            title: true
          }
        },
        assets: true
      },
      orderBy: { invitedAt: 'desc' }  // ← FIXED: changed from createdAt to invitedAt
    });

    res.json({
      success: true,
      beneficiaries
    });
  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beneficiaries',
      error: error.message
    });
  }
};

exports.getBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id,
        OR: [
          { estate: { ownerId: userId } },
          { userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            sevispassUid: true,
            profilePhoto: true,
            province: true
          }
        },
        estate: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        },
        assets: true
      }
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    res.json({
      success: true,
      beneficiary
    });
  } catch (error) {
    console.error('Get beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beneficiary',
      error: error.message
    });
  }
};

exports.updateBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { relationship, sharePercentage, status } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.beneficiary.findFirst({
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
        message: 'Beneficiary not found or you do not have permission'
      });
    }

    const beneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        relationship: relationship || existing.relationship,
        sharePercentage: sharePercentage ? parseFloat(sharePercentage) : existing.sharePercentage,
        status: status || existing.status,
        acceptedAt: status === 'accepted' ? new Date() : existing.acceptedAt
      }
    });

    await ledgerService.createEntry(
      'BENEFICIARY_UPDATED',
      sevispassUid,
      {
        beneficiaryId: id,
        status: beneficiary.status
      }
    );

    res.json({
      success: true,
      message: 'Beneficiary updated successfully',
      beneficiary
    });
  } catch (error) {
    console.error('Update beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update beneficiary',
      error: error.message
    });
  }
};

exports.deleteBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.beneficiary.findFirst({
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
        message: 'Beneficiary not found or you do not have permission'
      });
    }

    await prisma.beneficiary.delete({
      where: { id }
    });

    await ledgerService.createEntry(
      'BENEFICIARY_REMOVED',
      sevispassUid,
      {
        beneficiaryId: id,
        userId: existing.userId
      }
    );

    res.json({
      success: true,
      message: 'Beneficiary removed successfully'
    });
  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove beneficiary',
      error: error.message
    });
  }
};

// Beneficiary-specific endpoints for the beneficiary dashboard
exports.getBeneficiaryEstates = async (req, res) => {
  try {
    const userId = req.user.id;

    const estates = await prisma.estate.findMany({
      where: {
        beneficiaries: {
          some: { userId }
        }
      },
      include: {
        owner: {
          select: {
            name: true,
            sevispassUid: true
          }
        },
        assets: {
          where: { status: 'active' }
        },
        beneficiaries: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        documents: {
          where: { visibility: 'public' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      estates
    });
  } catch (error) {
    console.error('Get beneficiary estates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estates',
      error: error.message
    });
  }
};

exports.getBeneficiaryDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await prisma.document.findMany({
      where: {
        estate: {
          beneficiaries: {
            some: { userId }
          }
        },
        visibility: 'public'
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Get beneficiary documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};