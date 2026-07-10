const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    // For now, we'll check if user is admin (sevispassUid MOCK-UID-005)
    if (roles.includes('admin') && req.user.sevispassUid !== 'MOCK-UID-005') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - admin role required'
      });
    }
    next();
  };
};