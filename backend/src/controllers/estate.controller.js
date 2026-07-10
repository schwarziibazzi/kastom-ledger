const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const prisma = new PrismaClient();

exports.createEstate = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const estate = await prisma.estate.create({
      data: {
        ownerId: userId,
        title,
        description,
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
      message: 'Failed to create estate'
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
      message: 'Failed to fetch estates'
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
        digitalWill: true,
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
      message: 'Failed to fetch estate'
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
        description: description || existing.description,
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
      message: 'Failed to update estate'
    });
  }
};

exports.deleteEstate = async (req, res) => {
  try {
    const { id } = req.params;
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
      message: 'Failed to delete estate'
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
      message: 'Failed to fetch estate status'
    });
  }
};