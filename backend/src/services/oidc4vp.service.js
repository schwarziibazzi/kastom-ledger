const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OIDC4VPService {
  constructor() {
    this.sessions = new Map();
    this.serverUrl = process.env.OIDC4VP_SERVER_URL || 'http://localhost:5000';
    this.clientId = process.env.CLIENT_ID || 'kastom-ledger-client';
    this.clientSecret = process.env.CLIENT_SECRET || 'kastom-ledger-secret';
    this.callbackUrl = process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/callback';
  }

  // Generate a QR code for authentication
  async generateQRCode(userId) {
    try {
      const sessionId = this.generateSessionId();
      const state = this.generateState();
      const nonce = this.generateNonce();

      // Store session
      this.sessions.set(sessionId, {
        userId,
        state,
        nonce,
        authenticated: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Create presentation request
      const presentationRequest = {
        id: `pr-${Date.now()}`,
        type: 'VerifiablePresentationRequest',
        challenge: nonce,
        domain: this.serverUrl,
        credentials: [
          {
            type: ['VerifiableCredential', 'SevisPassCredential'],
            issuer: 'did:sevis:pngext1',
            credentialSubject: {
              id: `did:sevis:pngext1:${userId}`
            }
          }
        ]
      };

      // Generate QR code as SVG
      const requestData = JSON.stringify(presentationRequest);
      const qrCodeSvg = await QRCode.toString(requestData, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#14532D',
          light: '#FFFFFF'
        }
      });

      return {
        qrCode: qrCodeSvg,
        sessionId,
        state,
        nonce
      };
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw error;
    }
  }

  // Mock authentication - simulate wallet scanning
  async authenticateWithQR(sessionId, userId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (new Date() > session.expiresAt) {
        this.sessions.delete(sessionId);
        throw new Error('Session expired');
      }

      // Update session
      session.authenticated = true;
      session.userId = userId;
      session.authenticatedAt = new Date();
      this.sessions.set(sessionId, session);

      // Generate access token
      const accessToken = this.generateAccessToken(userId, sessionId);

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          sevispassUid: true,
          province: true,
          role: true,
          verificationStatus: true
        }
      });

      return {
        success: true,
        sessionId,
        accessToken,
        user,
        redirect: `/auth/callback?session=${sessionId}`
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Check session status
  async getSessionStatus(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          sessionId,
          authenticated: false,
          hasRedirect: false
        };
      }

      return {
        sessionId,
        authenticated: session.authenticated || false,
        hasRedirect: session.authenticated || false,
        redirect: session.authenticated ? `/auth/callback?session=${sessionId}` : null
      };
    } catch (error) {
      console.error('Session status error:', error);
      throw error;
    }
  }

  // Get user info from session
  async getUserInfo(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.authenticated) {
        throw new Error('Session not authenticated');
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: {
          sub: user.id,
          name: user.name,
          sevispassUid: user.sevispassUid,
          province: user.province,
          role: user.role,
          verificationStatus: user.verificationStatus,
          ageOver18: true,
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        sessionId,
        fieldMappings: {
          'sub': 'User ID',
          'name': 'Full Name',
          'sevispassUid': 'SevisPass UID',
          'province': 'Province',
          'role': 'User Role'
        }
      };
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  // Generate tokens
  generateAccessToken(userId, sessionId) {
    return jwt.sign(
      {
        userId,
        sessionId,
        iss: this.serverUrl,
        aud: this.clientId
      },
      this.clientSecret,
      { expiresIn: '1h' }
    );
  }

  // Helpers
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateState() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Cleanup expired sessions
  cleanupSessions() {
    const now = new Date();
    for (const [key, session] of this.sessions) {
      if (session.expiresAt && new Date(session.expiresAt) < now) {
        this.sessions.delete(key);
      }
    }
  }
}

module.exports = new OIDC4VPService();