const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

class SevisWalletService {
  constructor() {
    // SevisWallet is just a container - no ID
    // It's bound to the user's verified phone number
  }

  // Generate a DID (Decentralized Identifier) for a user
  generateDID(userId, sevispassUid) {
    // DID format: did:sevis:pngext1:1234567890
    const did = `did:sevis:pngext1:${sevispassUid}`;
    return did;
  }

  // Initialize SevisWallet for a user
  async initializeWallet(userId, phoneNumber) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate DID if not exists
      let sevisDid = user.sevisDid;
      if (!sevisDid) {
        sevisDid = this.generateDID(userId, user.sevispassUid);
      }

      // Update user with wallet info
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          sevisDid: sevisDid,
          sevisWalletPhone: phoneNumber || user.phone,
          sevisWalletInstalled: true,
          sevisWalletLastSync: new Date()
        }
      });

      // Create SevisPass credential in wallet
      await this.addCredential(userId, {
        type: 'sevispass',
        data: {
          did: sevisDid,
          name: user.name,
          uid: user.sevispassUid,
          tier: user.sevisPassTier || 'Tier-1',
          province: user.province,
          dateOfBirth: user.dateOfBirth,
          issuedAt: new Date().toISOString(),
          verified: true
        },
        issuer: 'Government of Papua New Guinea - SevisPass Authority'
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          actionType: 'SEVIS_WALLET_INITIALIZED',
          timestamp: new Date(),
          currentHash: crypto.createHash('sha256')
            .update(`${userId}:${Date.now()}`)
            .digest('hex'),
          metadata: {
            did: sevisDid,
            phone: phoneNumber,
            walletInstalled: true
          },
          user: {
            connect: { id: userId }
          }
        }
      });

      return {
        success: true,
        message: 'SevisWallet initialized successfully',
        did: sevisDid,
        wallet: {
          phone: updated.sevisWalletPhone,
          installed: updated.sevisWalletInstalled,
          lastSync: updated.sevisWalletLastSync
        }
      };
    } catch (error) {
      console.error('Initialize wallet error:', error);
      throw error;
    }
  }

  // Add a credential to the wallet
  async addCredential(userId, credentialData) {
    try {
      const credentialHash = crypto.createHash('sha256')
        .update(JSON.stringify(credentialData))
        .digest('hex');

      const credential = await prisma.walletCredential.create({
        data: {
          userId,
          credentialType: credentialData.type,
          credentialData: credentialData.data,
          issuer: credentialData.issuer || 'SevisPass Authority',
          issuedAt: new Date(),
          verified: true,
          verifiedAt: new Date(),
          credentialHash
        }
      });

      return credential;
    } catch (error) {
      console.error('Add credential error:', error);
      throw error;
    }
  }

  // Get wallet contents (all credentials)
  async getWalletContents(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          walletCredentials: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        did: user.sevisDid,
        phone: user.sevisWalletPhone,
        installed: user.sevisWalletInstalled,
        lastSync: user.sevisWalletLastSync,
        credentials: user.walletCredentials.map(c => ({
          type: c.credentialType,
          data: c.credentialData,
          issuer: c.issuer,
          issuedAt: c.issuedAt,
          verified: c.verified,
          hash: c.credentialHash
        }))
      };
    } catch (error) {
      console.error('Get wallet contents error:', error);
      throw error;
    }
  }

  // Request data via SevisDEx (P2P bridge)
  async requestPeerData(requesterId, responderId, requestType, requestData) {
    try {
      // Create a P2P data request
      const request = await prisma.peerDataRequest.create({
        data: {
          requesterId,
          responderId,
          requestType,
          requestData,
          status: 'pending',
          sevisDexReference: `SEVIS-DEX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          encryptionKey: crypto.randomBytes(32).toString('hex'),
          requestedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Create notification for responder (wallet owner)
      await prisma.notification.create({
        data: {
          userId: responderId,
          type: 'DATA_REQUEST',
          title: '📱 SevisDEx Data Request',
          message: `Someone is requesting to read your ${requestType} from your SevisWallet. Open your wallet to approve or reject.`,
          link: `/sevis/requests/${request.id}`,
          read: false
        }
      });

      return request;
    } catch (error) {
      console.error('Request peer data error:', error);
      throw error;
    }
  }

  // Respond to P2P data request (wallet owner approves)
  async respondToPeerData(requestId, responderId, approved, responseData) {
    try {
      const request = await prisma.peerDataRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: true,
          responder: true
        }
      });

      if (!request) {
        throw new Error('Request not found');
      }

      if (request.responderId !== responderId) {
        throw new Error('You are not the responder for this request');
      }

      const status = approved ? 'completed' : 'rejected';

      const updated = await prisma.peerDataRequest.update({
        where: { id: requestId },
        data: {
          status,
          responseData: approved ? responseData : null,
          respondedAt: new Date()
        }
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          actionType: approved ? 'PEER_DATA_APPROVED' : 'PEER_DATA_REJECTED',
          timestamp: new Date(),
          currentHash: crypto.createHash('sha256')
            .update(`${requestId}:${status}:${Date.now()}`)
            .digest('hex'),
          metadata: {
            requestId,
            requester: request.requester.sevispassUid,
            responder: request.responder.sevispassUid,
            requestType: request.requestType,
            approved
          },
          user: {
            connect: { id: responderId }
          }
        }
      });

      // Notify requester
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          type: approved ? 'DATA_APPROVED' : 'DATA_REJECTED',
          title: approved ? '✅ Data Request Approved' : '❌ Data Request Rejected',
          message: approved 
            ? `${request.responder.name} has approved your data request. Data has been sent securely.`
            : `${request.responder.name} has rejected your data request.`,
          link: `/sevis/requests/${requestId}`,
          read: false
        }
      });

      return updated;
    } catch (error) {
      console.error('Respond to peer data error:', error);
      throw error;
    }
  }
}

module.exports = new SevisWalletService();