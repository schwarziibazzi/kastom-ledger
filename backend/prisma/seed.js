const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function generateHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create mock users with proper roles
  const mockUsers = [
    { 
      sevispassUid: 'MOCK-UID-001', 
      name: 'John Kasi', 
      dateOfBirth: '1985-06-15', 
      province: 'National Capital District', 
      role: 'OWNER' 
    },
    { 
      sevispassUid: 'MOCK-UID-002', 
      name: 'Mary Wama', 
      dateOfBirth: '1990-08-22', 
      province: 'Morobe Province', 
      role: 'BENEFICIARY' 
    },
    { 
      sevispassUid: 'MOCK-UID-003', 
      name: 'Peter Tau', 
      dateOfBirth: '1975-03-10', 
      province: 'Eastern Highlands Province', 
      role: 'WITNESS' 
    },
    { 
      sevispassUid: 'MOCK-UID-004', 
      name: 'Sarah Kila', 
      dateOfBirth: '1995-11-28', 
      province: 'West New Britain Province', 
      role: 'BENEFICIARY' 
    },
    { 
      sevispassUid: 'MOCK-UID-005', 
      name: 'Admin User', 
      dateOfBirth: '1980-01-01', 
      province: 'National Capital District', 
      role: 'ADMINISTRATOR' 
    }
  ];

  for (const userData of mockUsers) {
    await prisma.user.upsert({
      where: { sevispassUid: userData.sevispassUid },
      update: {
        name: userData.name,
        province: userData.province,
        role: userData.role,
        verificationStatus: 'verified'
      },
      create: {
        sevispassUid: userData.sevispassUid,
        name: userData.name,
        dateOfBirth: new Date(userData.dateOfBirth),
        province: userData.province,
        role: userData.role,
        verificationStatus: 'verified'
      }
    });
  }

  console.log(`✅ Created/Updated ${mockUsers.length} mock users with roles`);

  // Get John Kasi (MOCK-UID-001)
  const john = await prisma.user.findUnique({
    where: { sevispassUid: 'MOCK-UID-001' }
  });

  if (!john) {
    console.error('❌ John Kasi not found');
    return;
  }

  // Create an estate for John
  const estate = await prisma.estate.create({
    data: {
      ownerId: john.id,
      title: 'Kasi Family Estate',
      description: 'The Kasi family estate containing all family assets and properties.',
      status: 'ACTIVE',
      completionPercentage: 75
    }
  });

  console.log(`✅ Created estate: ${estate.title}`);

  // Create assets for the estate
  const assets = [
    {
      estateId: estate.id,
      type: 'LAND',
      title: 'Kasi Family Land - Madang',
      description: '2.5 hectares of family land in Madang Province',
      estimatedValue: 250000,
      location: 'Madang Province',
      status: 'active',
      titleNumber: 'MSL-001245',
      registryAuthority: 'Department of Lands',
      verificationStatus: 'government_verified',
      sevisDexVerified: true
    },
    {
      estateId: estate.id,
      type: 'VEHICLE',
      title: 'Toyota Land Cruiser',
      description: 'Family vehicle for transportation',
      estimatedValue: 85000,
      location: 'Port Moresby',
      status: 'active',
      registrationNumber: 'TBA-1234',
      registryAuthority: 'MVIL',
      verificationStatus: 'government_verified',
      sevisDexVerified: true
    },
    {
      estateId: estate.id,
      type: 'HOUSE',
      title: 'Kasi Family Home',
      description: 'The family home in Port Moresby',
      estimatedValue: 350000,
      location: 'Port Moresby, NCD',
      status: 'active',
      registryAuthority: 'Department of Lands',
      verificationStatus: 'self_declared'
    },
    {
      estateId: estate.id,
      type: 'BUSINESS',
      title: 'Kasi Family Business',
      description: 'Family business enterprise',
      estimatedValue: 150000,
      location: 'Lae, Morobe Province',
      status: 'active',
      businessNumber: 'IPB-7890',
      registryAuthority: 'IPA',
      verificationStatus: 'self_declared'
    },
    {
      estateId: estate.id,
      type: 'SAVINGS',
      title: 'Family Savings Account',
      description: 'Savings account for the family',
      estimatedValue: 50000,
      location: 'Port Moresby',
      status: 'active',
      accountNumber: 'BSP-001234',
      registryAuthority: 'BSP Bank',
      verificationStatus: 'self_declared'
    }
  ];

  for (const assetData of assets) {
    await prisma.asset.create({
      data: assetData
    });
  }

  console.log(`✅ Created ${assets.length} assets for the estate`);

  // Add Mary Wama as beneficiary
  const mary = await prisma.user.findUnique({
    where: { sevispassUid: 'MOCK-UID-002' }
  });

  if (mary) {
    await prisma.beneficiary.create({
      data: {
        estateId: estate.id,
        userId: mary.id,
        name: mary.name,
        relationship: 'Daughter',
        sharePercentage: 50,
        status: 'accepted',
        invitedAt: new Date(),
        acceptedAt: new Date()
      }
    });
    console.log(`✅ Added ${mary.name} as beneficiary`);
  }

  // Add Sarah Kila as beneficiary
  const sarah = await prisma.user.findUnique({
    where: { sevispassUid: 'MOCK-UID-004' }
  });

  if (sarah) {
    await prisma.beneficiary.create({
      data: {
        estateId: estate.id,
        userId: sarah.id,
        name: sarah.name,
        relationship: 'Daughter',
        sharePercentage: 50,
        status: 'accepted',
        invitedAt: new Date(),
        acceptedAt: new Date()
      }
    });
    console.log(`✅ Added ${sarah.name} as beneficiary`);
  }

  // Create a digital will for the estate
  const digitalWill = await prisma.digitalWill.create({
    data: {
      estateId: estate.id,
      introduction: 'I, John Kasi, being of sound mind, declare this to be my last will and testament.',
      executorNotes: 'Mary Wama is appointed as the executor of this estate. She has my full trust and confidence to manage the distribution of my assets.',
      personalMessages: 'To my family, I leave you my love and my legacy. Take care of one another and honor our traditions.',
      status: 'submitted',
      submittedAt: new Date()
    }
  });

  console.log('✅ Created digital will for the estate');

  // Add witnesses to the will
  const peter = await prisma.user.findUnique({
    where: { sevispassUid: 'MOCK-UID-003' }
  });

  if (peter && digitalWill) {
    await prisma.willWitness.create({
      data: {
        willId: digitalWill.id,
        name: peter.name,
        email: 'peter.tau@email.com',
        relationship: 'Elder',
        status: 'verified',
        verifiedAt: new Date()
      }
    });
    console.log(`✅ Added ${peter.name} as will witness`);
  }

  // Create government integrations
  const integrations = [
    { name: 'SevisPass', serviceType: 'sevispass' },
    { name: 'SevisWallet', serviceType: 'seviswallet' },
    { name: 'SevisDEx', serviceType: 'sevisdex' },
    { name: 'Civil & Identity Registry', serviceType: 'civil_registry' },
    { name: 'Department of Lands & Physical Planning', serviceType: 'dlpp' },
    { name: 'Investment Promotion Authority (IPA)', serviceType: 'ipa' },
    { name: 'MVIL', serviceType: 'mvil' },
    { name: 'Banking Gateway', serviceType: 'banking' }
  ];

  for (const integration of integrations) {
    const existing = await prisma.governmentIntegration.findFirst({
      where: { serviceType: integration.serviceType }
    });

    if (existing) {
      await prisma.governmentIntegration.update({
        where: { id: existing.id },
        data: {
          name: integration.name,
          connectionStatus: integration.serviceType === 'banking' ? 'disconnected' : 'connected',
          healthStatus: integration.serviceType === 'banking' ? 'unknown' : 'healthy',
          apiVersion: 'v1.0.0',
          environment: 'sandbox',
          lastSync: new Date(),
          lastSyncStatus: 'success'
        }
      });
    } else {
      await prisma.governmentIntegration.create({
        data: {
          name: integration.name,
          serviceType: integration.serviceType,
          connectionStatus: integration.serviceType === 'banking' ? 'disconnected' : 'connected',
          healthStatus: integration.serviceType === 'banking' ? 'unknown' : 'healthy',
          apiVersion: 'v1.0.0',
          environment: 'sandbox',
          lastSync: new Date(),
          lastSyncStatus: 'success'
        }
      });
    }
  }

  console.log('✅ Created government integrations');

  // Connect John's wallet
  await prisma.user.update({
    where: { id: john.id },
    data: {
      sevisDid: `did:sevis:pngext1:${john.sevispassUid}`,
      sevisPassTier: 'Tier-1',
      sevisWalletPhone: '675 7123 4567',
      sevisWalletInstalled: true,
      sevisWalletLastSync: new Date()
    }
  });

  console.log('✅ Updated John\'s SevisWallet settings');

  // Create wallet credentials for John
  const credentials = [
    {
      userId: john.id,
      credentialType: 'sevispass',
      credentialData: {
        did: `did:sevis:pngext1:${john.sevispassUid}`,
        name: john.name,
        uid: john.sevispassUid,
        tier: 'Tier-1',
        province: john.province,
        dateOfBirth: john.dateOfBirth,
        issuedAt: new Date().toISOString(),
        verified: true
      },
      issuer: 'Government of Papua New Guinea - SevisPass Authority',
      verified: true,
      verifiedAt: new Date()
    },
    {
      userId: john.id,
      credentialType: 'drivers_license',
      credentialData: {
        licenseNumber: 'DL-001234',
        class: 'A',
        expiry: '2028-12-31'
      },
      issuer: 'DLPP - National Driver Licensing',
      verified: true,
      verifiedAt: new Date()
    }
  ];

  for (const cred of credentials) {
    const credentialHash = generateHash(cred.credentialData);
    await prisma.walletCredential.create({
      data: {
        userId: cred.userId,
        credentialType: cred.credentialType,
        credentialData: cred.credentialData,
        issuer: cred.issuer,
        issuedAt: new Date(),
        verified: cred.verified,
        verifiedAt: cred.verifiedAt,
        credentialHash: credentialHash
      }
    });
  }

  console.log('✅ Created wallet credentials');

  // Create initial ledger entries
  const ledgerEntries = [
    {
      actionType: 'SEVIS_WALLET_INITIALIZED',
      timestamp: new Date(),
      currentHash: generateHash('wallet_init'),
      metadata: { did: john.sevisDid, installed: true }
    },
    {
      actionType: 'ESTATE_CREATED',
      timestamp: new Date(),
      currentHash: generateHash('estate_created'),
      metadata: { estateId: estate.id, title: estate.title }
    },
    {
      actionType: 'DIGITAL_WILL_CREATED',
      timestamp: new Date(),
      currentHash: generateHash('will_created'),
      metadata: { estateId: estate.id }
    }
  ];

  for (const entry of ledgerEntries) {
    await prisma.ledgerEntry.create({
      data: {
        actionType: entry.actionType,
        timestamp: entry.timestamp,
        currentHash: entry.currentHash,
        metadata: entry.metadata,
        user: {
          connect: { id: john.id }
        }
      }
    });
  }

  console.log('✅ Created ledger entries');
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