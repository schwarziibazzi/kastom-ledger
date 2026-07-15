const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class SevisDexService {
  constructor() {
    this.departments = {
      DLPP: 'Department of Lands & Physical Planning',
      MVIL: 'Motor Vehicle Insurance Ltd',
      IPA: 'Investment Promotion Authority',
      CIVIL: 'Civil & Identity Registry',
      CURATOR: 'Public Curator Office',
      BSP: 'Bank South Pacific',
      NAMBWAN: 'Nambawan Super'
    };
  }

  // Generate unique reference
  generateReference() {
    return `SEVIS-DEX-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  // Query Department of Lands (DLPP)
  async queryLandsRegistry(titleNumber, owner) {
    console.log(`📡 Querying DLPP Registry for Title: ${titleNumber}`);
    
    // Mock DLPP response
    const mockData = {
      'MSL-001245': {
        owner: 'John Kasi',
        titleNumber: 'MSL-001245',
        province: 'Madang',
        status: 'Registered',
        propertyAddress: 'Lot 45, Section 22, Madang Town',
        landSize: '2.5 hectares',
        landType: 'Freehold',
        registrationDate: '2015-03-12',
        lastUpdated: '2024-06-15',
        certified: true,
        caveats: false
      },
      'MSL-002341': {
        owner: 'John Kasi',
        titleNumber: 'MSL-002341',
        province: 'National Capital District',
        status: 'Registered',
        propertyAddress: 'Section 56, Lot 12, Waigani Drive, Port Moresby',
        landSize: '800 square meters',
        landType: 'Leasehold',
        registrationDate: '2018-07-22',
        lastUpdated: '2024-05-10',
        certified: true,
        caveats: false
      }
    };

    const record = mockData[titleNumber] || null;

    if (record) {
      return {
        success: true,
        verified: true,
        department: 'DLPP',
        data: {
          ...record,
          sevisDexReference: this.generateReference(),
          verifiedAt: new Date().toISOString(),
          source: 'Department of Lands & Physical Planning - National Land Registry',
          authentication: 'Verified through SevisPass Digital Identity'
        }
      };
    }

    return {
      success: true,
      verified: false,
      department: 'DLPP',
      data: {
        message: 'No matching records found in the National Land Registry',
        sevisDexReference: this.generateReference(),
        suggestions: 'Please verify the title number with the Department of Lands & Physical Planning.'
      }
    };
  }

  // Query Civil Registry (Death Records)
  async queryCivilRegistry(citizenId) {
    console.log(`📡 Querying Civil Registry for Citizen: ${citizenId}`);

    // Mock Civil Registry response
    return {
      success: true,
      verified: true,
      department: 'CIVIL',
      data: {
        citizenId: citizenId,
        name: 'John Kasi',
        dateOfBirth: '1985-06-15',
        deathRecord: null, // null means alive, date means deceased
        lastUpdated: new Date().toISOString(),
        sevisDexReference: this.generateReference(),
        source: 'Civil & Identity Registry - Death Register'
      }
    };
  }

  // Update death record in Civil Registry
  async updateDeathRecord(estateId, citizenId, deathCertificate) {
    console.log(`📡 Updating Civil Registry Death Record for: ${citizenId}`);

    // Create death verification record
    const verification = await prisma.deathVerification.create({
      data: {
        estateId,
        requesterId: citizenId,
        deathCertificate: deathCertificate.url,
        certificateHash: deathCertificate.hash,
        status: 'pending',
        civilRegistryReference: `CIVIL-${Date.now()}`,
        deathRegisteredAt: new Date()
      }
    });

    return {
      success: true,
      verification,
      sevisDexReference: this.generateReference(),
      civilRegistryReference: `CIVIL-${Date.now()}`,
      message: 'Death registered with Civil & Identity Registry'
    };
  }

  // Query Public Curator
  async queryPublicCurator(estateId) {
    console.log(`📡 Querying Public Curator for Estate: ${estateId}`);

    return {
      success: true,
      verified: true,
      department: 'CURATOR',
      data: {
        estateId,
        status: 'Pending Administration',
        curatorReference: `PC-${Date.now()}`,
        sevisDexReference: this.generateReference(),
        source: 'Public Curator Office - Estate Administration'
      }
    };
  }

  // Request final verification before transfer
  async requestFinalVerification(estateId, assetId) {
    console.log(`📡 Requesting Final Verification for Estate: ${estateId}, Asset: ${assetId}`);

    // Mock verification from all departments
    const departments = [
      'DLPP', 'MVIL', 'IPA', 'CIVIL', 'CURATOR'
    ];

    const results = {};
    let allVerified = true;

    for (const dept of departments) {
      results[dept] = {
        status: 'verified',
        timestamp: new Date().toISOString(),
        reference: this.generateReference(),
        verifiedBy: this.departments[dept]
      };
      allVerified = allVerified && true;
    }

    return {
      success: true,
      verified: allVerified,
      results,
      sevisDexReference: this.generateReference(),
      message: allVerified ? 'All departments have verified the estate and transfer is permitted' : 'Some departments require further verification'
    };
  }

  // Verify land through SevisDEx
  async verifyLand(assetId, titleNumber, owner, province) {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: { estate: { include: { owner: true } } }
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Query DLPP registry
      const dlppResult = await this.queryLandsRegistry(titleNumber, owner);

      // Create SevisDEx request record
      const request = await prisma.sevisDexRequest.create({
        data: {
          assetId,
          estateId: asset.estateId,
          userId: asset.estate.ownerId,
          requestType: 'land_verification',
          referenceNumber: this.generateReference(),
          department: 'DLPP',
          departmentReference: titleNumber,
          requestData: { titleNumber, owner, province },
          status: dlppResult.verified ? 'completed' : 'pending'
        }
      });

      // Update asset
      const updatedAsset = await prisma.asset.update({
        where: { id: assetId },
        data: {
          sevisDexReference: dlppResult.data?.sevisDexReference || this.generateReference(),
          sevisDexVerified: dlppResult.verified || false,
          sevisDexVerifiedAt: dlppResult.verified ? new Date() : null,
          sevisDexData: dlppResult.data || null,
          sevisDexStatus: dlppResult.verified ? 'verified' : 'rejected',
          department: 'DLPP',
          departmentReference: titleNumber
        }
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          actionType: 'SEVIS_DEX_VERIFICATION',
          timestamp: new Date(),
          currentHash: crypto.createHash('sha256')
            .update(`${assetId}:${dlppResult.verified}:${Date.now()}`)
            .digest('hex'),
          metadata: {
            assetId,
            verified: dlppResult.verified,
            sevisDexReference: updatedAsset.sevisDexReference,
            titleNumber,
            department: 'DLPP',
            sevisDexData: dlppResult.data
          },
          user: {
            connect: { id: asset.estate.ownerId }
          }
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: asset.estate.ownerId,
          estateId: asset.estateId,
          type: 'VERIFICATION_COMPLETE',
          title: dlppResult.verified ? '✅ Asset Verified by DLPP' : '⚠️ Asset Verification Failed',
          message: dlppResult.verified 
            ? `Land title ${titleNumber} has been successfully verified through the Department of Lands & Physical Planning.`
            : `Land title ${titleNumber} could not be verified. Please contact DLPP.`,
          link: `/assets/${assetId}`,
          read: false
        }
      });

      return {
        success: true,
        verified: dlppResult.verified || false,
        request,
        asset: updatedAsset,
        dlppResult
      };
    } catch (error) {
      console.error('SevisDEx verification error:', error);
      throw error;
    }
  }

  // Process death registration
  async processDeathRegistration(estateId, requesterId, deathCertificate) {
    try {
      const estate = await prisma.estate.findUnique({
        where: { id: estateId },
        include: { owner: true }
      });

      if (!estate) {
        throw new Error('Estate not found');
      }

      // Update Civil Registry
      const civilResult = await this.updateDeathRecord(
        estateId,
        estate.owner.id,
        deathCertificate
      );

      // Query Public Curator
      const curatorResult = await this.queryPublicCurator(estateId);

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          actionType: 'DEATH_REGISTRATION',
          timestamp: new Date(),
          currentHash: crypto.createHash('sha256')
            .update(`${estateId}:${Date.now()}`)
            .digest('hex'),
          metadata: {
            estateId,
            civilRegistryReference: civilResult.civilRegistryReference,
            sevisDexReference: civilResult.sevisDexReference,
            requesterId
          },
          user: {
            connect: { id: requesterId }
          }
        }
      });

      // Update estate
      await prisma.estate.update({
        where: { id: estateId },
        data: {
          status: 'DEATH_VERIFIED',
          deathVerifiedAt: new Date(),
          deathCertificate: deathCertificate.url,
          publicCuratorReview: true
        }
      });

      // Notify Public Curator
      await prisma.notification.create({
        data: {
          userId: requesterId,
          estateId,
          type: 'ADMIN_VERIFIED',
          title: '🏛️ Public Curator Notified',
          message: `Estate ${estate.title} has been flagged for Public Curator administration.`,
          link: `/estate/${estateId}`,
          read: false
        }
      });

      return {
        success: true,
        civilResult,
        curatorResult,
        sevisDexReference: civilResult.sevisDexReference
      };
    } catch (error) {
      console.error('Process death registration error:', error);
      throw error;
    }
  }

  // Execute succession transfer through departments
  async executeSuccessionTransfer(estateId, beneficiaryId) {
    try {
      const estate = await prisma.estate.findUnique({
        where: { id: estateId },
        include: {
          owner: true,
          beneficiaries: {
            where: { userId: beneficiaryId }
          },
          assets: true
        }
      });

      if (!estate) {
        throw new Error('Estate not found');
      }

      const beneficiary = estate.beneficiaries[0];
      if (!beneficiary) {
        throw new Error('Beneficiary not found');
      }

      // Request final verification
      const finalVerification = await this.requestFinalVerification(estateId, estate.assets[0]?.id);

      // Create succession transfer records
      const transfers = [];
      for (const asset of estate.assets) {
        const transfer = await prisma.successionTransfer.create({
          data: {
            estateId,
            fromUserId: estate.ownerId,
            toUserId: beneficiary.userId,
            assetIds: [asset.id],
            status: 'completed',
            sevisDexReference: this.generateReference(),
            department: asset.department || 'DLPP',
            transferType: asset.type.toLowerCase(),
            departmentTransferReference: asset.departmentReference || asset.titleNumber,
            transferredAt: new Date()
          }
        });
        transfers.push(transfer);
      }

      // Update estate
      await prisma.estate.update({
        where: { id: estateId },
        data: {
          successionCompleted: true,
          successionCompletedAt: new Date(),
          status: 'COMPLETED',
          publicCuratorApproved: true,
          publicCuratorReviewedAt: new Date()
        }
      });

      // Update beneficiary
      await prisma.beneficiary.update({
        where: { id: beneficiary.id },
        data: {
          successionActivated: true,
          successionActivatedAt: new Date()
        }
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          actionType: 'SUCCESSION_TRANSFER',
          timestamp: new Date(),
          currentHash: crypto.createHash('sha256')
            .update(`${estateId}:${beneficiaryId}:${Date.now()}`)
            .digest('hex'),
          metadata: {
            estateId,
            beneficiaryId,
            transfers: transfers.map(t => t.id),
            sevisDexReference: finalVerification.sevisDexReference,
            departments: finalVerification.results
          },
          user: {
            connect: { id: estate.ownerId }
          }
        }
      });

      return {
        success: true,
        transfers,
        finalVerification,
        sevisDexReference: finalVerification.sevisDexReference
      };
    } catch (error) {
      console.error('Execute succession transfer error:', error);
      throw error;
    }
  }
}

module.exports = new SevisDexService();