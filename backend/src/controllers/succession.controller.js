const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const prisma = new PrismaClient();

exports.startSuccession = async (req, res) => {
  try {
    const { ownerUid, successorId } = req.body;
    const requesterUid = req.user.sevispassUid;

    // Only admin or the successor can start succession
    // For demo purposes, we'll allow it with proper checks
    const owner = await prisma.user.findUnique({
      where: { sevispassUid: ownerUid }
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    const successor = await prisma.successor.findFirst({
      where: { 
        id: successorId,
        legacyOwnerUid: ownerUid
      }
    });

    if (!successor) {
      return res.status(404).json({
        success: false,
        message: 'Successor nomination not found'
      });
    }

    // Create succession event
    const event = await prisma.successionEvent.create({
      data: {
        successorId,
        ownerUid,
        status: 'pending'
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'SUCCESSION_STARTED',
      requesterUid,
      {
        ownerUid,
        successorId,
        eventId: event.id,
        timestamp: new Date().toISOString()
      }
    );

    res.status(201).json({
      success: true,
      message: 'Succession process initiated',
      event
    });
  } catch (error) {
    console.error('Start succession error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start succession process'
    });
  }
};

exports.verifyDeath = async (req, res) => {
  try {
    const { eventId } = req.params;
    const requesterUid = req.user.sevispassUid;

    // In production, this would require proper death verification
    // For demo, only admin can verify (MOCK-UID-005)
    if (requesterUid !== 'MOCK-UID-005') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can verify death'
      });
    }

    const event = await prisma.successionEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Succession event not found'
      });
    }

    const updatedEvent = await prisma.successionEvent.update({
      where: { id: eventId },
      data: {
        deathVerified: true,
        deathVerifiedAt: new Date(),
        status: 'death_verified'
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'DEATH_VERIFIED',
      requesterUid,
      {
        eventId,
        ownerUid: event.ownerUid,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: 'Death verified successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Verify death error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify death'
    });
  }
};

exports.grantAccess = async (req, res) => {
  try {
    const { eventId } = req.params;
    const successorUid = req.user.sevispassUid;

    const event = await prisma.successionEvent.findUnique({
      where: { id: eventId },
      include: {
        successor: true
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Succession event not found'
      });
    }

    // Check if user is the designated successor
    if (event.successor.successorUid !== successorUid) {
      return res.status(403).json({
        success: false,
        message: 'You are not the designated successor for this event'
      });
    }

    // Check if death is verified
    if (!event.deathVerified) {
      return res.status(403).json({
        success: false,
        message: 'Death must be verified before access can be granted'
      });
    }

    const updatedEvent = await prisma.successionEvent.update({
      where: { id: eventId },
      data: {
        status: 'access_granted',
        accessGrantedAt: new Date()
      }
    });

    // Log to ledger
    await ledgerService.createEntry(
      'SUCCESSION_ACCESS_GRANTED',
      successorUid,
      {
        eventId,
        ownerUid: event.ownerUid,
        timestamp: new Date().toISOString()
      }
    );

    // Get accessible items
    const accessibleItems = await prisma.legacyItem.findMany({
      where: {
        ownerUid: event.ownerUid,
        visibility: { in: ['public', 'successors'] }
      }
    });

    res.json({
      success: true,
      message: 'Access granted successfully',
      event: updatedEvent,
      accessibleItems
    });
  } catch (error) {
    console.error('Grant access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grant access'
    });
  }
};

exports.getSuccessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.successionEvent.findUnique({
      where: { id },
      include: {
        successor: {
          include: {
            successor: {
              select: {
                name: true,
                sevispassUid: true
              }
            },
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Succession event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get succession status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch succession status'
    });
  }
};