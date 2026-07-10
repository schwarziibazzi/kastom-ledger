const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create mock users
  const mockUsers = [
    { sevispassUid: 'MOCK-UID-001', name: 'John Kasi', dateOfBirth: '1985-06-15', province: 'National Capital District' },
    { sevispassUid: 'MOCK-UID-002', name: 'Mary Wama', dateOfBirth: '1990-08-22', province: 'Morobe Province' },
    { sevispassUid: 'MOCK-UID-003', name: 'Peter Tau', dateOfBirth: '1975-03-10', province: 'Eastern Highlands Province' },
    { sevispassUid: 'MOCK-UID-004', name: 'Sarah Kila', dateOfBirth: '1995-11-28', province: 'West New Britain Province' },
    { sevispassUid: 'MOCK-UID-005', name: 'Admin User', dateOfBirth: '1980-01-01', province: 'National Capital District' }
  ];

  for (const userData of mockUsers) {
    await prisma.user.upsert({
      where: { sevispassUid: userData.sevispassUid },
      update: {},
      create: {
        sevispassUid: userData.sevispassUid,
        name: userData.name,
        dateOfBirth: new Date(userData.dateOfBirth),
        province: userData.province,
        verificationStatus: 'verified'
      }
    });
  }

  console.log(`✅ Created ${mockUsers.length} mock users`);

  // Create a demo legacy profile for John Kasi
  const john = await prisma.user.findUnique({
    where: { sevispassUid: 'MOCK-UID-001' }
  });

  if (john) {
    const profile = await prisma.legacyProfile.upsert({
      where: { userId: john.id },
      update: {},
      create: {
        userId: john.id,
        title: 'Kasi Family Legacy',
        description: 'A record of our family history, traditions, and important knowledge passed down through generations.',
        culturalNotes: 'The Kasi family originates from the coastal regions of Papua New Guinea. We practice traditional customs of land stewardship and community leadership.'
      }
    });

    console.log('✅ Created legacy profile for John Kasi');

    // Add some legacy items
    const items = [
      {
        ownerUid: 'MOCK-UID-001',
        profileId: profile.id,
        category: 'Family History',
        title: 'Kasi Family Tree',
        description: 'Detailed family tree tracing back to my great-grandfather, including important relationships and clan connections.',
        visibility: 'successors'
      },
      {
        ownerUid: 'MOCK-UID-001',
        profileId: profile.id,
        category: 'Property Information',
        title: 'Land Titles and Boundaries',
        description: 'Documentation of family land holdings, boundaries, and traditional usage rights.',
        visibility: 'private'
      },
      {
        ownerUid: 'MOCK-UID-001',
        profileId: profile.id,
        category: 'Cultural Responsibility',
        title: 'Elder Responsibilities',
        description: 'Details of my role as a village elder, including mediation duties and community leadership responsibilities.',
        visibility: 'successors'
      }
    ];

    for (const itemData of items) {
      await prisma.legacyItem.upsert({
        where: { id: 'dummy' },
        update: {},
        create: itemData
      });
    }

    console.log(`✅ Added ${items.length} legacy items`);

    // Nominate a successor
    const mary = await prisma.user.findUnique({
      where: { sevispassUid: 'MOCK-UID-002' }
    });

    if (mary) {
      const successor = await prisma.successor.create({
        data: {
          legacyOwnerUid: 'MOCK-UID-001',
          successorUid: 'MOCK-UID-002',
          relationship: 'Daughter',
          accessLevel: 'editor',
          legacyProfileId: profile.id,
          status: 'verified'
        }
      });

      console.log('✅ Created successor nomination');

      // Add witness
      const peter = await prisma.user.findUnique({
        where: { sevispassUid: 'MOCK-UID-003' }
      });

      if (peter) {
        await prisma.witness.create({
          data: {
            witnessUid: 'MOCK-UID-003',
            successorId: successor.id,
            legacyProfileId: profile.id,
            actionVerified: 'successor_nomination',
            digitalSignature: 'WITNESS_APPROVED_DEMO_001'
          }
        });

        console.log('✅ Added witness confirmation');
      }
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });