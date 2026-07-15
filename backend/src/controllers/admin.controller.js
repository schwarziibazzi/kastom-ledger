const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const [totalUsers, totalEstates, totalLedgerEntries, totalDocuments] = await Promise.all([
      prisma.user.count(),
      prisma.estate.count(),
      prisma.ledgerEntry.count(),
      prisma.document.count()
    ]);

    const pendingVerifications = await prisma.deathVerification.count({
      where: { status: 'pending' }
    });

    const activeUsers = await prisma.user.count({
      where: { verificationStatus: 'verified' }
    });

    const connectedIntegrations = await prisma.governmentIntegration.count({
      where: { connectionStatus: 'connected' }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEstates,
        pendingVerifications,
        totalLedgerEntries,
        activeUsers,
        totalDocuments,
        connectedIntegrations,
        pendingSyncs: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
};

// Get recent activity
exports.getActivity = async (req, res) => {
  try {
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activity, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              name: true,
              sevispassUid: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.count()
    ]);

    res.json({
      success: true,
      activity,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity',
      error: error.message
    });
  }
};

// Get pending reviews
exports.getPendingReviews = async (req, res) => {
  try {
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const pendingDeathVerifications = await prisma.deathVerification.findMany({
      where: { status: 'pending' },
      include: {
        estate: {
          select: {
            id: true,
            title: true
          }
        },
        requester: {
          select: {
            name: true,
            sevispassUid: true
          }
        }
      },
      orderBy: { requestedAt: 'desc' },
      take: 10
    });

    const reviews = pendingDeathVerifications.map(v => ({
      id: v.id,
      title: `Death Verification - ${v.estate?.title || 'Estate'}`,
      user: v.requester,
      type: 'death_verification',
      createdAt: v.requestedAt
    }));

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending reviews',
      error: error.message
    });
  }
};

// Get users (admin only)
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        sevispassUid: true,
        province: true,
        role: true,
        verificationStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get audit logs
exports.getAudit = async (req, res) => {
  try {
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const auditEntries = await prisma.ledgerEntry.findMany({
      include: {
        user: {
          select: {
            name: true,
            sevispassUid: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const formattedEntries = auditEntries.map(entry => ({
      id: entry.id,
      actionType: entry.actionType,
      entityType: entry.actionType.split('_')[0] || 'System',
      entityId: entry.metadata?.estateId || entry.metadata?.assetId || 'N/A',
      hash: entry.currentHash,
      status: 'verified',
      createdAt: entry.timestamp,
      user: entry.user
    }));

    const stats = {
      total: await prisma.ledgerEntry.count(),
      verified: await prisma.ledgerEntry.count({ where: { currentHash: { not: null } } }),
      suspicious: 0,
      needsReview: 0
    };

    res.json({
      success: true,
      auditEntries: formattedEntries,
      stats
    });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit',
      error: error.message
    });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    if (req.user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator only.'
      });
    }

    const { range = '30d' } = req.query;

    // Get user growth (mock data for demo)
    const userGrowth = [
      { date: '2026-01-01', value: 10 },
      { date: '2026-02-01', value: 25 },
      { date: '2026-03-01', value: 45 },
      { date: '2026-04-01', value: 70 },
      { date: '2026-05-01', value: 100 },
      { date: '2026-06-01', value: 150 },
      { date: '2026-07-01', value: 200 }
    ];

    // Get estate stats
    const estateStats = [
      { label: 'Draft', value: await prisma.estate.count({ where: { status: 'DRAFT' } }) },
      { label: 'Active', value: await prisma.estate.count({ where: { status: 'ACTIVE' } }) },
      { label: 'Pending Witness', value: await prisma.estate.count({ where: { status: 'PENDING_WITNESS' } }) },
      { label: 'Verified', value: await prisma.estate.count({ where: { status: 'WITNESS_APPROVED' } }) },
      { label: 'Completed', value: await prisma.estate.count({ where: { status: 'COMPLETED' } }) }
    ];

    // Get activity stats
    const activityStats = [
      { label: 'Logins', value: await prisma.ledgerEntry.count({ where: { actionType: 'USER_LOGIN' } }), color: 'bg-blue-500' },
      { label: 'Estate Actions', value: await prisma.ledgerEntry.count({ where: { actionType: { contains: 'ESTATE' } } }), color: 'bg-green-500' },
      { label: 'Witness Actions', value: await prisma.ledgerEntry.count({ where: { actionType: { contains: 'WITNESS' } } }), color: 'bg-yellow-500' },
      { label: 'Asset Actions', value: await prisma.ledgerEntry.count({ where: { actionType: { contains: 'ASSET' } } }), color: 'bg-purple-500' }
    ];

    res.json({
      success: true,
      reports: {
        userGrowth,
        estateStats,
        activityStats
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};