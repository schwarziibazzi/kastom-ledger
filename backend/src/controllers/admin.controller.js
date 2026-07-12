const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
  try {
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
      message: 'Failed to fetch users'
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalEstates = await prisma.estate.count();
    const totalLedgerEntries = await prisma.ledgerEntry.count();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEstates,
        totalLedgerEntries
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};