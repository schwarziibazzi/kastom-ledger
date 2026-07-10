require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth.routes');
const legacyRoutes = require('./routes/legacy.routes');
const successorRoutes = require('./routes/successor.routes');
const witnessRoutes = require('./routes/witness.routes');
const ledgerRoutes = require('./routes/ledger.routes');
const successionRoutes = require('./routes/succession.routes');
const uploadRoutes = require('./routes/upload.routes');
const estateRoutes = require('./routes/estate.routes');
const assetsRoutes = require('./routes/assets.routes');
const beneficiariesRoutes = require('./routes/beneficiaries.routes');
const notificationRoutes = require('./routes/notification.routes');
const searchRoutes = require('./routes/search.routes');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: () => process.env.NODE_ENV === 'development'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kastom Ledger API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/legacy', legacyRoutes);
app.use('/api/successors', successorRoutes);
app.use('/api/witness', witnessRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/succession', successionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/estates', estateRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/beneficiaries', beneficiariesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kastom Ledger Server running on port ${PORT}`);
  console.log(`📊 API URL: http://localhost:${PORT}/api`);
});