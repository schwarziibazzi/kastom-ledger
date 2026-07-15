const { PrismaClient } = require('@prisma/client');
const integrationService = require('../services/integration.service');
const prisma = new PrismaClient();

// Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    const integrations = await integrationService.getIntegrations();
    res.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get integrations',
      error: error.message
    });
  }
};

// Test connection
exports.testConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await integrationService.testConnection(id);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connection',
      error: error.message
    });
  }
};

// Sync integration
exports.syncIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await integrationService.syncIntegration(id);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Sync integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync integration',
      error: error.message
    });
  }
};

// Get sync logs
exports.getSyncLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    const logs = await integrationService.getSyncLogs(id, parseInt(limit));
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Get sync logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync logs',
      error: error.message
    });
  }
};

// Update integration configuration
exports.updateConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { configuration } = req.body;

    const integration = await prisma.governmentIntegration.update({
      where: { id },
      data: {
        configuration,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Configuration updated',
      integration
    });
  } catch (error) {
    console.error('Update configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message
    });
  }
};

// Get integration stats
exports.getIntegrationStats = async (req, res) => {
  try {
    const stats = await integrationService.getIntegrationStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get integration stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get integration stats',
      error: error.message
    });
  }
};

// Get health dashboard
exports.getHealthDashboard = async (req, res) => {
  try {
    const data = await integrationService.getHealthDashboard();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get health dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health dashboard',
      error: error.message
    });
  }
};

// Connect user to integration
exports.connectUserIntegration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { integrationId } = req.params;

    const result = await integrationService.connectUserIntegration(userId, integrationId);

    res.json({
      success: true,
      message: 'Connected successfully',
      connection: result
    });
  } catch (error) {
    console.error('Connect user integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect',
      error: error.message
    });
  }
};

// Import assets from registry
exports.importAssets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { integrationId } = req.params;
    const { estateId } = req.body;

    // Update connection with estateId
    await prisma.userIntegrationConnection.updateMany({
      where: { userId, integrationId },
      data: { estateId }
    });

    const result = await integrationService.importAssetsFromRegistry(userId, integrationId);

    res.json({
      success: true,
      message: `Successfully imported ${result.imported} assets`,
      result
    });
  } catch (error) {
    console.error('Import assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import assets',
      error: error.message
    });
  }
};

// Get user's connected services
exports.getUserConnectedServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const connections = await integrationService.getUserConnectedServices(userId);
    res.json({
      success: true,
      connections
    });
  } catch (error) {
    console.error('Get user connected services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connected services',
      error: error.message
    });
  }
};