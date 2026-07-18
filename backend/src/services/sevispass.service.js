// Mock SevisPass Authentication Service
// In production, this would integrate with the real SevisPass API

const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock user database for demonstration
// Mock user database for demonstration
const mockUsers = {
  'MOCK-UID-001': {
    uid: 'MOCK-UID-001',
    name: 'John Kasi',
    dateOfBirth: '1985-06-15',
    province: 'National Capital District',
    verificationStatus: 'verified',
    sevispassUid: 'MOCK-UID-001',
    role: 'OWNER',
    sevisDid: '7825156201091271'
  },
  'MOCK-UID-002': {
    uid: 'MOCK-UID-002',
    name: 'Mary Wama',
    dateOfBirth: '1990-08-22',
    province: 'Morobe Province',
    verificationStatus: 'verified',
    sevispassUid: 'MOCK-UID-002',
    role: 'BENEFICIARY'
  },
  'MOCK-UID-003': {
    uid: 'MOCK-UID-003',
    name: 'Peter Tau',
    dateOfBirth: '1975-03-10',
    province: 'Eastern Highlands Province',
    verificationStatus: 'verified',
    sevispassUid: 'MOCK-UID-003',
    role: 'WITNESS'
  },
  'MOCK-UID-004': {
    uid: 'MOCK-UID-004',
    name: 'Sarah Kila',
    dateOfBirth: '1995-11-28',
    province: 'West New Britain Province',
    verificationStatus: 'verified',
    sevispassUid: 'MOCK-UID-004',
    role: 'BENEFICIARY'
  },
  'MOCK-UID-005': {
    uid: 'MOCK-UID-005',
    name: 'Admin User',
    dateOfBirth: '1980-01-01',
    province: 'National Capital District',
    verificationStatus: 'verified',
    sevispassUid: 'MOCK-UID-005',
    role: 'ADMINISTRATOR'
  }
};

class SevisPassService {
  /**
   * Mock login with SevisPass
   * In production: Redirect to SevisPass OAuth endpoint
   */
  async login(sevispassUid) {
    try {
      // Validate UID
      if (!sevispassUid || !mockUsers[sevispassUid]) {
        throw new Error('Invalid SevisPass UID');
      }

      const mockUser = mockUsers[sevispassUid];
      
      // Check if user exists in our database, if not create them
      let user = await prisma.user.findUnique({
        where: { sevispassUid: mockUser.sevispassUid }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            sevispassUid: mockUser.sevispassUid,
            name: mockUser.name,
            dateOfBirth: new Date(mockUser.dateOfBirth),
            province: mockUser.province,
            verificationStatus: mockUser.verificationStatus
          }
        });
      }

      // Return user data and auth token
      const token = this.generateToken(user);
      
      return {
        success: true,
        user: {
          id: user.id,
          sevispassUid: user.sevispassUid,
          name: user.name,
          dateOfBirth: user.dateOfBirth,
          province: user.province,
          verificationStatus: user.verificationStatus
        },
        token
      };
    } catch (error) {
      console.error('SevisPass login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        id: user.id, 
        sevispassUid: user.sevispassUid,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify user by SevisPass UID
   */
  async verifyUser(sevispassUid) {
    const user = await prisma.user.findUnique({
      where: { sevispassUid },
      include: {
        legacyProfile: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Get all mock users (for demo purposes)
   */
  getMockUsers() {
    return Object.values(mockUsers);
  }

  /**
   * Get specific mock user
   */
  getMockUser(uid) {
    return mockUsers[uid] || null;
  }
}

module.exports = new SevisPassService();