const { PrismaClient } = require('@prisma/client');
const ledgerService = require('./ledger.service');
const notificationService = require('./notification.service');
const prisma = new PrismaClient();

class EstateService {
  async createEstate(ownerId, data) {
    try {
      const estate = await prisma.estate.create({
        data: {
          ownerId,
          title: data.title,
          description: data.description,
          status: 'DRAFT'
        }
      });

      await ledgerService.createEntry(
        'ESTATE_CREATED',
        ownerId,
        { estateId: estate.id, title: estate.title }
      );

      await notificationService.createNotification(
        ownerId,
        'ESTATE_UPDATED',
        'Estate Created',
        `Your estate "${estate.title}" has been created.`
      );

      return estate;
    } catch (error) {
      console.error('Create estate error:', error);
      throw error;
    }
  }

  async getEstate(estateId, userId) {
    try {
      const estate = await prisma.estate.findUnique({
        where: { id: estateId },
        include: {
          owner: { select: { id: true, name: true, sevispassUid: true } },
          executor: { select: { id: true, name: true } },
          assets: { include: { documents: true } },
          beneficiaries: { include: { user: { select: { name: true, sevispassUid: true } } } },
          witnesses: { include: { witness: { select: { name: true } } } },
          digitalWill: true,
          institutionRequests: true
        }
      });

      // Check if user has access
      const isOwner = estate.ownerId === userId;
      const isExecutor = estate.executorId === userId;
      const isBeneficiary = estate.beneficiaries.some(b => b.userId === userId);

      if (!isOwner && !isExecutor && !isBeneficiary) {
        throw new Error('Unauthorized access to estate');
      }

      return estate;
    } catch (error) {
      console.error('Get estate error:', error);
      throw error;
    }
  }

  async getUserEstates(userId, role) {
    try {
      let estates = [];

      if (role === 'OWNER') {
        estates = await prisma.estate.findMany({
          where: { ownerId: userId },
          include: {
            assets: true,
            beneficiaries: { include: { user: { select: { name: true } } } }
          },
          orderBy: { updatedAt: 'desc' }
        });
      } else if (role === 'BENEFICIARY') {
        estates = await prisma.estate.findMany({
          where: {
            beneficiaries: { some: { userId } }
          },
          include: {
            owner: { select: { name: true } },
            assets: { where: { status: 'active' } },
            beneficiaries: { include: { user: { select: { name: true } } } }
          },
          orderBy: { updatedAt: 'desc' }
        });
      }

      return estates;
    } catch (error) {
      console.error('Get user estates error:', error);
      return [];
    }
  }

  async updateEstateStatus(estateId, status, userId) {
    try {
      const estate = await prisma.estate.update({
        where: { id: estateId },
        data: { status }
      });

      await ledgerService.createEntry(
        `ESTATE_${status}`,
        userId,
        { estateId, status }
      );

      return estate;
    } catch (error) {
      console.error('Update estate status error:', error);
      throw error;
    }
  }

  async calculateCompletion(estateId) {
    try {
      const estate = await prisma.estate.findUnique({
        where: { id: estateId },
        include: {
          assets: true,
          beneficiaries: true,
          witnesses: true,
          digitalWill: true
        }
      });

      let total = 0;
      let completed = 0;

      // Check if title exists
      if (estate.title) completed++;
      total++;

      // Check if description exists
      if (estate.description) completed++;
      total++;

      // Check if assets exist
      if (estate.assets.length > 0) completed++;
      total++;

      // Check if beneficiaries exist
      if (estate.beneficiaries.length > 0) completed++;
      total++;

      // Check if witnesses exist
      if (estate.witnesses.some(w => w.status === 'verified')) completed++;
      total++;

      // Check if digital will exists
      if (estate.digitalWill) completed++;
      total++;

      const percentage = Math.round((completed / total) * 100);

      await prisma.estate.update({
        where: { id: estateId },
        data: { completionPercentage: percentage }
      });

      return percentage;
    } catch (error) {
      console.error('Calculate completion error:', error);
      return 0;
    }
  }

  async addAsset(estateId, data, userId) {
    try {
      const asset = await prisma.asset.create({
        data: {
          estateId,
          type: data.type,
          title: data.title,
          description: data.description,
          estimatedValue: data.estimatedValue,
          location: data.location
        }
      });

      await ledgerService.createEntry(
        'ASSET_ADDED',
        userId,
        { estateId, assetId: asset.id, title: asset.title }
      );

      await notificationService.createNotification(
        userId,
        'ESTATE_UPDATED',
        'Asset Added',
        `Asset "${asset.title}" has been added to your estate.`
      );

      return asset;
    } catch (error) {
      console.error('Add asset error:', error);
      throw error;
    }
  }

  async addBeneficiary(estateId, data, userId) {
    try {
      const beneficiary = await prisma.beneficiary.create({
        data: {
          estateId,
          userId: data.userId,
          relationship: data.relationship,
          sharePercentage: data.sharePercentage
        }
      });

      await ledgerService.createEntry(
        'BENEFICIARY_ADDED',
        userId,
        { estateId, beneficiaryId: beneficiary.id }
      );

      await notificationService.createNotification(
        data.userId,
        'BENEFICIARY_ACCEPTED',
        'Beneficiary Invitation',
        `You have been added as a beneficiary to an estate.`
      );

      return beneficiary;
    } catch (error) {
      console.error('Add beneficiary error:', error);
      throw error;
    }
  }
}

module.exports = new EstateService();