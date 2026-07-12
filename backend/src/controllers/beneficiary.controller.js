const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getEstates = async (req, res) => {
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
            sevispassUid: true,
            profilePhoto: true
          }
        },
        assets: {
          where: { status: 'active' }
        },
        beneficiaries: {
          include: {
            user: {
              select: {
                name: true,
                sevispassUid: true
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

exports.getEstate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const estate = await prisma.estate.findFirst({
      where: {
        id,
        beneficiaries: {
          some: { userId }
        }
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
          where: { status: 'active' }
        },
        beneficiaries: {
          include: {
            user: {
              select: {
                name: true,
                sevispassUid: true
              }
            }
          }
        },
        documents: {
          where: { visibility: 'public' }
        },
        digitalWill: {
          select: {
            id: true,
            status: true,
            personalMessages: true
          }
        }
      }
    });

    if (!estate) {
      return res.status(404).json({
        success: false,
        message: 'Estate not found or you are not a beneficiary'
      });
    }

    res.json({
      success: true,
      estate
    });
  } catch (error) {
    console.error('Get beneficiary estate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch estate',
      error: error.message
    });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const userId = req.user.id;

    const assets = await prisma.asset.findMany({
      where: {
        estate: {
          beneficiaries: {
            some: { userId }
          }
        }
      },
      include: {
        estate: {
          select: {
            id: true,
            title: true,
            owner: {
              select: {
                name: true
              }
            }
          }
        },
        beneficiary: {
          where: { userId },
          select: {
            sharePercentage: true,
            relationship: true
          }
        },
        documents: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      assets
    });
  } catch (error) {
    console.error('Get beneficiary assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message
    });
  }
};

exports.getDocuments = async (req, res) => {
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

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get messages/notifications for beneficiary
    const messages = await prisma.notification.findMany({
      where: {
        userId,
        type: {
          in: ['BENEFICIARY_ACCEPTED', 'BENEFICIARY_NOTIFIED', 'DOCUMENT_UPLOADED']
        }
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
      messages
    });
  } catch (error) {
    console.error('Get beneficiary messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};