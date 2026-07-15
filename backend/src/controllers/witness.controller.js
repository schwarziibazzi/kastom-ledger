const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const prisma = new PrismaClient();

exports.requestWitness = async (req, res) => {
  try {
    const { successorId, witnessUid, actionVerified } = req.body;
    const ownerUid = req.user.sevispassUid;

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

    const witness = await prisma.user.findUnique({
      where: { sevispassUid: witnessUid }
    });

    if (!witness) {
      return res.status(404).json({
        success: false,
        message: 'Witness not found in system'
      });
    }

    const witnessRecord = await prisma.witness.create({
      data: {
        witnessUid,
        successorId,
        legacyProfileId: successor.legacyProfileId,
        actionVerified: actionVerified || 'successor_nomination',
        digitalSignature: `MOCK_SIG_${Date.now()}_${Math.random().toString(36).substring(7)}`
      }
    });

    await prisma.successor.update({
      where: { id: successorId },
      data: { status: 'witness_pending' }
    });

    await ledgerService.createEntry(
      'WITNESS_REQUESTED',
      ownerUid,
      {
        successorId,
        witnessUid,
        actionVerified: witnessRecord.actionVerified
      }
    );

    await notificationService.createNotification(
      witness.id,
      'WITNESS_REQUESTED',
      'Witness Request',
      `You have been requested to witness a succession nomination.`,
      `/witness-requests/${witnessRecord.id}`,
      successor.legacyProfileId
    );

    res.status(201).json({
      success: true,
      message: 'Witness request created',
      witnessRecord
    });
  } catch (error) {
    console.error('Request witness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request witness'
    });
  }
};

exports.getWitnessRequests = async (req, res) => {
  try {
    const witnessUid = req.user.sevispassUid;

    const requests = await prisma.witness.findMany({
      where: { witnessUid },
      include: {
        successor: {
          include: {
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            },
            legacyProfile: true
          }
        },
        legacyProfile: true
      },
      orderBy: { timestamp: 'desc' }
    });

    const estateWitnessRequests = await prisma.estateWitness.findMany({
      where: { 
        witnessId: req.user.id,
        status: 'pending'
      },
      include: {
        estate: {
          include: {
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      requests: [...requests, ...estateWitnessRequests]
    });
  } catch (error) {
    console.error('Get witness requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch witness requests'
    });
  }
};

exports.getWitnessRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const witnessUid = req.user.sevispassUid;

    let request = await prisma.witness.findFirst({
      where: { 
        id, 
        witnessUid 
      },
      include: {
        successor: {
          include: {
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            },
            legacyProfile: true
          }
        },
        legacyProfile: true
      }
    });

    if (!request) {
      request = await prisma.estateWitness.findFirst({
        where: { 
          id, 
          witnessId: req.user.id 
        },
        include: {
          estate: {
            include: {
              owner: {
                select: {
                  name: true,
                  sevispassUid: true
                }
              },
              assets: true,
              beneficiaries: {
                include: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Witness request not found'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get witness request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch witness request'
    });
  }
};

exports.approveWitness = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const witnessUid = req.user.sevispassUid;
    const witnessId = req.user.id;

    let request = await prisma.witness.findFirst({
      where: { id, witnessUid }
    });

    if (request) {
      const updated = await prisma.witness.update({
        where: { id },
        data: {
          digitalSignature: `APPROVED_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          comments: comments || null
        }
      });

      await prisma.successor.update({
        where: { id: request.successorId },
        data: { status: 'verified' }
      });

      await ledgerService.createEntry(
        'WITNESS_APPROVED',
        witnessUid,
        {
          witnessId: id,
          successorId: request.successorId
        }
      );

      await notificationService.createNotification(
        request.successor?.ownerId || request.legacyProfile?.userId,
        'WITNESS_APPROVED',
        'Witness Approved',
        'Your witness request has been approved.',
        '/witness-requests',
        request.legacyProfileId
      );

      return res.json({
        success: true,
        message: 'Witness approved successfully',
        witness: updated
      });
    }

    let estateRequest = await prisma.estateWitness.findFirst({
      where: { id, witnessId }
    });

    if (estateRequest) {
      const updated = await prisma.estateWitness.update({
        where: { id },
        data: {
          status: 'verified',
          comments: comments || null,
          verifiedAt: new Date()
        }
      });

      await ledgerService.createEntry(
        'ESTATE_WITNESS_APPROVED',
        witnessUid,
        {
          estateId: estateRequest.estateId,
          witnessId: id
        }
      );

      await notificationService.createNotification(
        estateRequest.estate.ownerId,
        'WITNESS_APPROVED',
        'Estate Witness Approved',
        'Your estate witness request has been approved.',
        `/estate/${estateRequest.estateId}`,
        estateRequest.estateId
      );

      return res.json({
        success: true,
        message: 'Estate witness approved successfully',
        witness: updated
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Witness request not found'
    });
  } catch (error) {
    console.error('Approve witness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve witness'
    });
  }
};

exports.rejectWitness = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const witnessUid = req.user.sevispassUid;
    const witnessId = req.user.id;

    let request = await prisma.witness.findFirst({
      where: { id, witnessUid }
    });

    if (request) {
      const updated = await prisma.witness.update({
        where: { id },
        data: {
          digitalSignature: `REJECTED_${Date.now()}`,
          comments: comments || null
        }
      });

      await prisma.successor.update({
        where: { id: request.successorId },
        data: { status: 'rejected' }
      });

      return res.json({
        success: true,
        message: 'Witness request rejected',
        witness: updated
      });
    }

    let estateRequest = await prisma.estateWitness.findFirst({
      where: { id, witnessId }
    });

    if (estateRequest) {
      const updated = await prisma.estateWitness.update({
        where: { id },
        data: {
          status: 'rejected',
          comments: comments || null,
          verifiedAt: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Estate witness request rejected',
        witness: updated
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Witness request not found'
    });
  } catch (error) {
    console.error('Reject witness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject witness'
    });
  }
};

exports.getApproved = async (req, res) => {
  try {
    const witnessUid = req.user.sevispassUid;

    const requests = await prisma.witness.findMany({
      where: {
        witnessUid,
        digitalSignature: { not: null }
      },
      include: {
        successor: {
          include: {
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            },
            legacyProfile: true
          }
        },
        legacyProfile: true
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get approved witnesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved requests'
    });
  }
};

exports.getRejected = async (req, res) => {
  try {
    const witnessUid = req.user.sevispassUid;

    const requests = await prisma.witness.findMany({
      where: {
        witnessUid,
        digitalSignature: { contains: 'REJECTED' }
      },
      include: {
        successor: {
          include: {
            owner: {
              select: {
                name: true,
                sevispassUid: true
              }
            },
            legacyProfile: true
          }
        },
        legacyProfile: true
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get rejected witnesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rejected requests'
    });
  }
};