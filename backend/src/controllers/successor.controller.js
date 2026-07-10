const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const prisma = new PrismaClient();

exports.nominateSuccessor = async (req, res) => {
  try {
    const { successorUid, relationship, accessLevel } = req.body;
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

    // Check if successor exists in our system
    const successor = await prisma.user.findUnique({
      where: { sevispassUid: successorUid }
    });

    if (!successor) {
      return res.status(404).json({
        success: false,
        message: 'Successor not found in system. They must have a SevisPass account.'
      });
    }

    // Check if already nominated
    const existingNomination = await prisma.successor.findFirst({
      where: {
        legacyOwnerUid: ownerUid,
        successorUid
      }
    });

    if (existingNomination) {
      return res.status(400).json({
        success: false,
        message: 'This person is already nominated as a successor'
      });
    }

    const nomination = await prisma.successor.create({
      data: {
        legacyOwnerUid: ownerUid,
        successorUid,
        relationship,
        accessLevel: accessLevel || 'viewer',
        legacyProfileId: profile.id,
        status: 'pending_witness'
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'SUCCESSOR_NOMINATED',
      ownerUid,
      {
        nominationId: nomination.id,
        successorUid,
        relationship,
        timestamp: new Date().toISOString()
      }
    );

    res.status(201).json({
      success: true,
      message: 'Successor nominated successfully',
      nomination
    });
  } catch (error) {
    console.error('Nominate successor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to nominate successor'
    });
  }
};

exports.getSuccessors = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.legacyProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Legacy profile not found'
      });
    }

    const successors = await prisma.successor.findMany({
      where: { legacyProfileId: profile.id },
      include: {
        successor: {
          select: {
            name: true,
            sevispassUid: true,
            province: true
          }
        },
        witness: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      successors
    });
  } catch (error) {
    console.error('Get successors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch successors'
    });
  }
};

exports.getPendingWitnessRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const pendingRequests = await prisma.successor.findMany({
      where: {
        successorUid: sevispassUid,
        status: 'pending_witness'
      },
      include: {
        owner: {
          select: {
            name: true,
            sevispassUid: true
          }
        },
        legacyProfile: true,
        witness: true
      }
    });

    res.json({
      success: true,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get pending witness requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending witness requests'
    });
  }
};

exports.updateSuccessorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerUid = req.user.sevispassUid;

    const successor = await prisma.successor.findFirst({
      where: { id, legacyOwnerUid: ownerUid }
    });

    if (!successor) {
      return res.status(404).json({
        success: false,
        message: 'Successor nomination not found or you do not have permission'
      });
    }

    const updated = await prisma.successor.update({
      where: { id },
      data: { status }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'SUCCESSOR_STATUS_UPDATED',
      ownerUid,
      {
        successorId: id,
        newStatus: status,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: 'Successor status updated',
      successor: updated
    });
  } catch (error) {
    console.error('Update successor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update successor status'
    });
  }
};