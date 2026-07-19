const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OIDC4VPService {
  constructor() {
    this.sessions = new Map();
    this.authEndpoint = 'https://sso.stage.sevispass.gov.pg/realms/SevisPass-SSO/protocol/openid-connect/auth';
    this.tokenEndpoint = 'https://sso.stage.sevispass.gov.pg/realms/SevisPass-SSO/protocol/openid-connect/token';
    this.clientId = process.env.CLIENT_ID || 'crimson-coderz-hei-sevispass';
    this.clientSecret = process.env.CLIENT_SECRET || '8FJjDpEwDIRAFI90jhvIVWZIH58TexAx';
    this.callbackUrl = process.env.CALLBACK_URL || 'http://localhost:3001/auth/callback';
  }

  async generateQRCode(userId) {
    try {
      const sessionId = this.generateSessionId();
      const state = this.generateState();
      const nonce = this.generateNonce();

      this.sessions.set(sessionId, {
        userId,
        state,
        nonce,
        authenticated: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      // Generate QR code with the CORRECT auth endpoint
      // The QR code should be a URL that the SevisWallet app can open
      const authUrl = `${this.authEndpoint}?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.callbackUrl)}&state=${state}&nonce=${nonce}&response_type=code&scope=openid`;

      console.log('🔗 Generated auth URL:', authUrl);

      const qrCodeSvg = await QRCode.toString(authUrl, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: { dark: '#14532D', light: '#FFFFFF' }
      });

      return {
        qrCode: qrCodeSvg,
        sessionId: sessionId,
        state: state,
        nonce: nonce
      };
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }

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

      session.authenticated = true;
      session.userId = userId;
      session.authenticatedAt = new Date();
      this.sessions.set(sessionId, session);

      const accessToken = jwt.sign(
        { userId, sessionId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

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

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        this.tokenEndpoint,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.callbackUrl,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

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

  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateState() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  getSessionByState(state) {
    for (const [key, session] of this.sessions) {
      if (session.state === state) {
        return { sessionId: key, ...session };
      }
    }
    return null;
  }

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