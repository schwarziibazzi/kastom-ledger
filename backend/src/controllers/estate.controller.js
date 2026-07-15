const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

exports.createEstate = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Estate title is required'
      });
    }

    const estate = await prisma.estate.create({
      data: {
        ownerId: userId,
        title,
        description: description || '',
        status: 'DRAFT'
      }
    });

    await ledgerService.createEntry(
      'ESTATE_CREATED',
      sevispassUid,
      {
        estateId: estate.id,
        title: estate.title
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Estate Created',
      `Your estate "${estate.title}" has been created successfully.`,
      `/estate/${estate.id}`,
      estate.id
    );

    res.status(201).json({
      success: true,
      message: 'Estate created successfully',
      estate
    });
  } catch (error) {
    console.error('Create estate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create estate',
      error: error.message
    });
  }
};

exports.getEstates = async (req, res) => {
  try {
    const userId = req.user.id;

    const estates = await prisma.estate.findMany({
      where: { ownerId: userId },
      include: {
        assets: true,
        beneficiaries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                sevispassUid: true,
                profilePhoto: true
              }
            }
          }
        },
        witnesses: {
          include: {
            witness: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        },
        digitalWill: true,
        executor: {
          select: {
            name: true,
            sevispassUid: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      estates
    });
  } catch (error) {
    console.error('Get estates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estates',
      error: error.message
    });
  }
};

exports.getEstate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const estate = await prisma.estate.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { beneficiaries: { some: { userId } } },
          { executorId: userId }
        ]
      },
      include: {
        owner: {
          select: {
            name: true,
            sevispassUid: true,
            profilePhoto: true
          }
        },
        assets: {
          include: {
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
          }
        },
        beneficiaries: {
          include: {
            user: {
              select: {
                name: true,
                sevispassUid: true,
                profilePhoto: true
              }
            }
          }
        },
        witnesses: {
          include: {
            witness: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        },
        digitalWill: {
          include: {
            witnesses: true
          }
        },
        executor: {
          select: {
            name: true,
            sevispassUid: true
          }
        },
        documents: true,
        institutionRequests: true
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
      estate
    });
  } catch (error) {
    console.error('Get estate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estate',
      error: error.message
    });
  }
};

exports.updateEstate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.estate.findFirst({
      where: { id, ownerId: userId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    const estate = await prisma.estate.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        status: status || existing.status
      }
    });

    await ledgerService.createEntry(
      'ESTATE_UPDATED',
      sevispassUid,
      {
        estateId: estate.id,
        title: estate.title,
        status: estate.status
      }
    );

    await notificationService.createNotification(
      userId,
      'ESTATE_UPDATED',
      'Estate Updated',
      `Your estate "${estate.title}" has been updated.`,
      `/estate/${estate.id}`,
      estate.id
    );

    res.json({
      success: true,
      message: 'Estate updated successfully',
      estate
    });
  } catch (error) {
    console.error('Update estate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update estate',
      error: error.message
    });
  }
};

exports.deleteEstate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const existing = await prisma.estate.findFirst({
      where: { id, ownerId: userId },
      include: {
        assets: true,
        beneficiaries: true,
        witnesses: true,
        digitalWill: {
          include: {
            witnesses: true
          }
        },
        documents: true,
        institutionRequests: true,
        notifications: true,
        activityLogs: true
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you do not have permission'
      });
    }

    if (existing.documents && existing.documents.length > 0) {
      for (const doc of existing.documents) {
        try {
          const filePath = path.join(__dirname, '../../uploads', path.basename(doc.fileUrl));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    if (existing.digitalWill) {
      await prisma.willWitness.deleteMany({
        where: { willId: existing.digitalWill.id }
      });
    }

    await prisma.digitalWill.deleteMany({
      where: { estateId: id }
    });

    await prisma.estateWitness.deleteMany({
      where: { estateId: id }
    });

    await prisma.beneficiary.deleteMany({
      where: { estateId: id }
    });

    await prisma.asset.deleteMany({
      where: { estateId: id }
    });

    await prisma.document.deleteMany({
      where: { estateId: id }
    });

    await prisma.institutionRequest.deleteMany({
      where: { estateId: id }
    });

    await prisma.notification.deleteMany({
      where: { estateId: id }
    });

    await prisma.activityLog.deleteMany({
      where: { estateId: id }
    });

    await prisma.estate.delete({
      where: { id }
    });

    await ledgerService.createEntry(
      'ESTATE_DELETED',
      sevispassUid,
      {
        estateId: id,
        title: existing.title
      }
    );

    res.json({
      success: true,
      message: 'Estate deleted successfully'
    });
  } catch (error) {
    console.error('Delete estate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete estate',
      error: error.message
    });
  }
};

exports.getEstateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const estate = await prisma.estate.findFirst({
      where: { 
        id, 
        OR: [
          { ownerId: userId },
          { executorId: userId }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        completionPercentage: true,
        updatedAt: true,
        assets: {
          select: { id: true }
        },
        beneficiaries: {
          select: { id: true }
        },
        witnesses: {
          where: { status: 'verified' },
          select: { id: true }
        },
        digitalWill: {
          select: { id: true }
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
      estate
    });
  } catch (error) {
    console.error('Get estate status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estate status',
      error: error.message
    });
  }
};