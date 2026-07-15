const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class IntegrationService {
  constructor() {
    this.integrations = [
      {
        name: 'SevisPass',
        serviceType: 'sevispass',
        apiVersion: 'v2.1.0',
        environment: 'sandbox'
      },
      {
        name: 'SevisWallet',
        serviceType: 'seviswallet',
        apiVersion: 'v1.8.0',
        environment: 'sandbox'
      },
      {
        name: 'SevisDEx',
        serviceType: 'sevisdex',
        apiVersion: 'v3.2.0',
        environment: 'sandbox'
      },
      {
        name: 'Civil & Identity Registry',
        serviceType: 'civil_registry',
        apiVersion: 'v1.5.0',
        environment: 'sandbox'
      },
      {
        name: 'Department of Lands & Physical Planning',
        serviceType: 'dlpp',
        apiVersion: 'v2.0.0',
        environment: 'sandbox'
      },
      {
        name: 'Investment Promotion Authority (IPA)',
        serviceType: 'ipa',
        apiVersion: 'v1.3.0',
        environment: 'sandbox'
      },
      {
        name: 'MVIL',
        serviceType: 'mvil',
        apiVersion: 'v1.2.0',
        environment: 'sandbox'
      },
      {
        name: 'Banking Gateway',
        serviceType: 'banking',
        apiVersion: 'v1.0.0',
        environment: 'sandbox'
      }
    ];
  }

  // Initialize all integrations
  async initializeIntegrations() {
    try {
      for (const integration of this.integrations) {
        await prisma.governmentIntegration.upsert({
          where: { serviceType: integration.serviceType },
          update: {
            name: integration.name,
            apiVersion: integration.apiVersion,
            environment: integration.environment,
            updatedAt: new Date()
          },
          create: {
            name: integration.name,
            serviceType: integration.serviceType,
            apiVersion: integration.apiVersion,
            environment: integration.environment,
            connectionStatus: 'disconnected',
            healthStatus: 'unknown'
          }
        });
      }
      console.log('✅ Government integrations initialized');
    } catch (error) {
      console.error('Initialize integrations error:', error);
      throw error;
    }
  }

  // Get all integrations
  async getIntegrations() {
    try {
      return await prisma.governmentIntegration.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Get integrations error:', error);
      throw error;
    }
  }

  // Test connection to an integration
  async testConnection(integrationId) {
    try {
      const integration = await prisma.governmentIntegration.findUnique({
        where: { id: integrationId }
      });

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Simulate connection test
      const success = Math.random() > 0.1; // 90% success rate
      const latency = Math.floor(Math.random() * 200) + 50; // 50-250ms

      const status = success ? 'connected' : 'error';
      const health = success ? 'healthy' : 'error';

      await prisma.governmentIntegration.update({
        where: { id: integrationId },
        data: {
          connectionStatus: status,
          healthStatus: health,
          lastSync: new Date(),
          lastSyncStatus: success ? 'success' : 'failed',
          updatedAt: new Date()
        }
      });

      // Create sync log
      await prisma.integrationSyncLog.create({
        data: {
          integrationId,
          status: success ? 'success' : 'failed',
          message: success 
            ? `Connection test successful (${latency}ms)` 
            : 'Connection test failed - service unavailable',
          details: {
            latency,
            timestamp: new Date().toISOString()
          }
        }
      });

      return {
        success,
        latency,
        status,
        health,
        message: success ? 'Connected successfully' : 'Connection failed'
      };
    } catch (error) {
      console.error('Test connection error:', error);
      throw error;
    }
  }

  // Sync integration (simulate data sync)
  async syncIntegration(integrationId) {
    try {
      const integration = await prisma.governmentIntegration.findUnique({
        where: { id: integrationId }
      });

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Simulate sync
      const success = Math.random() > 0.15; // 85% success rate
      const recordsProcessed = Math.floor(Math.random() * 100) + 10;

      await prisma.governmentIntegration.update({
        where: { id: integrationId },
        data: {
          lastSync: new Date(),
          lastSyncStatus: success ? 'success' : 'failed',
          updatedAt: new Date()
        }
      });

      await prisma.integrationSyncLog.create({
        data: {
          integrationId,
          status: success ? 'success' : 'failed',
          message: success 
            ? `Synced ${recordsProcessed} records successfully` 
            : 'Sync failed - timeout',
          details: {
            recordsProcessed: success ? recordsProcessed : 0,
            timestamp: new Date().toISOString()
          }
        }
      });

      return {
        success,
        recordsProcessed: success ? recordsProcessed : 0,
        message: success ? 'Sync completed' : 'Sync failed'
      };
    } catch (error) {
      console.error('Sync integration error:', error);
      throw error;
    }
  }

  // Get sync logs
  async getSyncLogs(integrationId, limit = 20) {
    try {
      return await prisma.integrationSyncLog.findMany({
        where: { integrationId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Get sync logs error:', error);
      throw error;
    }
  }

  // Get integration stats for admin dashboard
  async getIntegrationStats() {
    try {
      const integrations = await prisma.governmentIntegration.findMany({
        include: {
          _count: {
            select: {
              userConnections: true
            }
          }
        }
      });

      const stats = {
        totalIntegrations: integrations.length,
        connected: integrations.filter(i => i.connectionStatus === 'connected').length,
        disconnected: integrations.filter(i => i.connectionStatus === 'disconnected').length,
        error: integrations.filter(i => i.connectionStatus === 'error').length,
        integrations: integrations.map(i => ({
          id: i.id,
          name: i.name,
          serviceType: i.serviceType,
          connectionStatus: i.connectionStatus,
          healthStatus: i.healthStatus,
          usersConnected: i._count.userConnections,
          lastSync: i.lastSync,
          apiVersion: i.apiVersion
        }))
      };

      return stats;
    } catch (error) {
      console.error('Get integration stats error:', error);
      throw error;
    }
  }

  // Connect user to integration
  async connectUserIntegration(userId, integrationId) {
    try {
      const connection = await prisma.userIntegrationConnection.upsert({
        where: {
          userId_integrationId: {
            userId,
            integrationId
          }
        },
        update: {
          connected: true,
          connectedAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          integrationId,
          connected: true,
          connectedAt: new Date()
        }
      });

      return connection;
    } catch (error) {
      console.error('Connect user integration error:', error);
      throw error;
    }
  }

  // Import assets from registry
  async importAssetsFromRegistry(userId, integrationId) {
    try {
      const connection = await prisma.userIntegrationConnection.findUnique({
        where: {
          userId_integrationId: {
            userId,
            integrationId
          }
        }
      });

      if (!connection) {
        throw new Error('User not connected to this integration');
      }

      // Mock imported assets
      const mockAssets = [
        {
          title: 'Kasi Family Land',
          type: 'LAND',
          description: 'Family land in Madang Province',
          estimatedValue: 250000,
          location: 'Madang',
          departmentReference: 'MSL-245',
          registryAuthority: 'Department of Lands',
          verificationStatus: 'government_verified'
        },
        {
          title: 'Toyota Land Cruiser',
          type: 'VEHICLE',
          description: 'Family vehicle',
          estimatedValue: 85000,
          location: 'Port Moresby',
          departmentReference: 'TBA-5678',
          registryAuthority: 'MVIL',
          verificationStatus: 'government_verified'
        }
      ];

      const importedAssets = [];
      for (const asset of mockAssets) {
        const created = await prisma.asset.create({
          data: {
            estateId: connection.estateId || null,
            type: asset.type,
            title: asset.title,
            description: asset.description,
            estimatedValue: asset.estimatedValue,
            location: asset.location,
            departmentReference: asset.departmentReference,
            registryAuthority: asset.registryAuthority,
            verificationStatus: asset.verificationStatus,
            importedVia: 'sevisdex',
            lastVerificationDate: new Date(),
            sevisDexVerified: true,
            sevisDexVerifiedAt: new Date(),
            sevisDexStatus: 'verified'
          }
        });
        importedAssets.push(created);
      }

      // Update connection
      await prisma.userIntegrationConnection.update({
        where: { id: connection.id },
        data: {
          assetsImported: { increment: importedAssets.length },
          lastImportAt: new Date()
        }
      });

      return {
        success: true,
        imported: importedAssets.length,
        assets: importedAssets
      };
    } catch (error) {
      console.error('Import assets error:', error);
      throw error;
    }
  }

  // Get user's connected services
  async getUserConnectedServices(userId) {
    try {
      const connections = await prisma.userIntegrationConnection.findMany({
        where: { userId, connected: true },
        include: {
          integration: true
        }
      });

      return connections;
    } catch (error) {
      console.error('Get user connected services error:', error);
      throw error;
    }
  }

  // Get integration health dashboard
  async getHealthDashboard() {
    try {
      const integrations = await prisma.governmentIntegration.findMany();
      
      const healthData = integrations.map(i => ({
        id: i.id,
        name: i.name,
        status: i.connectionStatus,
        health: i.healthStatus,
        uptime: i.connectionStatus === 'connected' ? `${Math.floor(Math.random() * 5) + 95}%` : 'N/A',
        lastSync: i.lastSync,
        usersConnected: 0 // Will be populated
      }));

      // Get user connection counts
      for (const item of healthData) {
        const count = await prisma.userIntegrationConnection.count({
          where: { 
            integrationId: item.id,
            connected: true
          }
        });
        item.usersConnected = count;
      }

      return healthData;
    } catch (error) {
      console.error('Get health dashboard error:', error);
      throw error;
    }
  }
}

module.exports = new IntegrationService();