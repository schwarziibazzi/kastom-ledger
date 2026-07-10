const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    const role = req.user.role || 'OWNER';

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        results: {
          assets: [],
          beneficiaries: [],
          documents: [],
          estates: [],
          users: []
        }
      });
    }

    const searchTerm = q.trim();
    const results = {
      assets: [],
      beneficiaries: [],
      documents: [],
      estates: [],
      users: []
    };

    // Owner can search their own stuff
    if (role === 'OWNER') {
      // Search estates
      results.estates = await prisma.estate.findMany({
        where: {
          ownerId: userId,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
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
        },
        take: 10
      });

      // Search assets
      results.assets = await prisma.asset.findMany({
        where: {
          estate: { ownerId: userId },
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          estate: {
            select: {
              id: true,
              title: true
            }
          }
        },
        take: 10
      });

      // Search beneficiaries
      results.beneficiaries = await prisma.beneficiary.findMany({
        where: {
          estate: { ownerId: userId },
          OR: [
            { relationship: { contains: searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } }
          ]
        },
        include: {
          user: {
            select: {
              name: true,
              sevispassUid: true
            }
          },
          estate: {
            select: {
              id: true,
              title: true
            }
          }
        },
        take: 10
      });

      // Search documents
      results.documents = await prisma.document.findMany({
        where: {
          estate: { ownerId: userId },
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          estate: {
            select: {
              id: true,
              title: true
            }
          }
        },
        take: 10
      });
    }

    // Admin can search users
    if (role === 'ADMINISTRATOR') {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { sevispassUid: { contains: searchTerm, mode: 'insensitive' } },
            { province: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          sevispassUid: true,
          province: true,
          role: true,
          verificationStatus: true
        },
        take: 10
      });
    }

    // Beneficiary can search shared estates
    if (role === 'BENEFICIARY') {
      results.estates = await prisma.estate.findMany({
        where: {
          beneficiaries: { some: { userId } },
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          owner: {
            select: {
              name: true
            }
          },
          assets: {
            where: { status: 'active' }
          }
        },
        take: 10
      });

      results.documents = await prisma.document.findMany({
        where: {
          estate: {
            beneficiaries: { some: { userId } }
          },
          visibility: 'public',
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          estate: {
            select: {
              id: true,
              title: true
            }
          }
        },
        take: 10
      });
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};