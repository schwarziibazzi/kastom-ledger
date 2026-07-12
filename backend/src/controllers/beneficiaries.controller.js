const { PrismaClient } = require('@prisma/client');
const ledgerService = require('../services/ledger.service');
const notificationService = require('../services/notification.service');
const crypto = require('crypto');
const prisma = new PrismaClient();

exports.createBeneficiary = async (req, res) => {
  try {
    const { estateId, userId, name, email, relationship, sharePercentage } = req.body;
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

    // Check if beneficiary already exists by name
    const existingByName = await prisma.beneficiary.findFirst({
      where: {
        estateId,
        name: name.trim()
      }
    });

    if (existingByName) {
      return res.status(400).json({
        success: false,
        message: 'A beneficiary with this name already exists in this estate'
      });
    }

    let beneficiaryUserId = userId;
    let beneficiaryStatus = 'pending';
    let invitationToken = null;

    // If userId is provided, check if user exists
    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (existingUser) {
        beneficiaryUserId = userId;
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
            message: 'This user is already a beneficiary'
          });
        }
        beneficiaryStatus = 'accepted'; // Auto-accept if already in system
      } else {
        beneficiaryUserId = null;
      }
    }

    // Generate invitation token if user not found or no userId provided
    if (!beneficiaryUserId) {
      invitationToken = crypto.randomBytes(32).toString('hex');
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        estateId,
        userId: beneficiaryUserId || null,
        name: name.trim(),
        email: email || null,
        relationship,
        sharePercentage: sharePercentage ? parseFloat(sharePercentage) : null,
        status: beneficiaryStatus,
        invitationToken,
        invitedAt: new Date()
      }
    });

    await ledgerService.createEntry(
      'BENEFICIARY_ADDED',
      sevispassUid,
      {
        estateId,
        beneficiaryId: beneficiary.id,
        name: beneficiary.name,
        hasAccount: !!beneficiaryUserId
      }
    );

    // Notification for estate owner
    await notificationService.createNotification(
      ownerId,
      'BENEFICIARY_ADDED',
      'Beneficiary Added',
      `${beneficiary.name} has been added as a beneficiary to "${estate.title}".`,
      `/beneficiaries/${beneficiary.id}`,
      estateId
    );

    // If beneficiary doesn't have an account, send invitation
    if (!beneficiaryUserId && email) {
      // In production: Send email with invitation link
      // For demo: Just notify owner
      await notificationService.createNotification(
        ownerId,
        'BENEFICIARY_ACCEPTED',
        'Invitation Required',
        `${beneficiary.name} needs to create a SevisPass account to claim their inheritance.`,
        `/beneficiaries/${beneficiary.id}`,
        estateId
      );
    }

    res.status(201).json({
      success: true,
      message: beneficiaryUserId ? 'Beneficiary added successfully' : 'Beneficiary added. They will need to create an account to claim their inheritance.',
      beneficiary,
      needsInvitation: !beneficiaryUserId
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
      orderBy: { invitedAt: 'desc' }
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
    const { name, email, relationship, sharePercentage, status } = req.body;
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
        name: name || existing.name,
        email: email || existing.email,
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
        name: existing.name
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

// Claim beneficiary invitation
exports.claimInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    const sevispassUid = req.user.sevispassUid;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        invitationToken: token,
        userId: null // Not yet claimed
      }
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or already claimed invitation'
      });
    }

    // Check if this user is already a beneficiary for this estate
    const existing = await prisma.beneficiary.findFirst({
      where: {
        estateId: beneficiary.estateId,
        userId
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already a beneficiary for this estate'
      });
    }

    const claimed = await prisma.beneficiary.update({
      where: { id: beneficiary.id },
      data: {
        userId,
        status: 'accepted',
        claimedAt: new Date(),
        invitationToken: null
      }
    });

    await ledgerService.createEntry(
      'BENEFICIARY_CLAIMED',
      sevispassUid,
      {
        beneficiaryId: claimed.id,
        estateId: claimed.estateId
      }
    );

    await notificationService.createNotification(
      claimed.estate.ownerId,
      'BENEFICIARY_ACCEPTED',
      'Beneficiary Claimed',
      `${claimed.name} has claimed their beneficiary invitation.`,
      `/beneficiaries/${claimed.id}`,
      claimed.estateId
    );

    res.json({
      success: true,
      message: 'Beneficiary invitation claimed successfully',
      beneficiary: claimed
    });
  } catch (error) {
    console.error('Claim invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim invitation',
      error: error.message
    });
  }
};

// Resend invitation
exports.resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id,
        estate: {
          ownerId: userId
        }
      }
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    if (beneficiary.userId) {
      return res.status(400).json({
        success: false,
        message: 'This beneficiary already has an account'
      });
    }

    if (!beneficiary.email) {
      return res.status(400).json({
        success: false,
        message: 'No email address on file to send invitation'
      });
    }

    // Generate new token
    const newToken = crypto.randomBytes(32).toString('hex');
    await prisma.beneficiary.update({
      where: { id },
      data: { invitationToken: newToken }
    });

    // In production: Send email with new invitation link
    // For demo: Just notify
    await notificationService.createNotification(
      userId,
      'BENEFICIARY_ACCEPTED',
      'Invitation Resent',
      `Invitation resent to ${beneficiary.name} at ${beneficiary.email}.`,
      `/beneficiaries/${beneficiary.id}`,
      beneficiary.estateId
    );

    res.json({
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend invitation',
      error: error.message
    });
  }
};

// Beneficiary-specific endpoints
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