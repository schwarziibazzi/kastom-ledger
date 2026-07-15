import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Database, 
  Shield, 
  Wallet, 
  Building, 
  Landmark, 
  Briefcase, 
  Car, 
  Banknote,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  Activity,
  BarChart3,
  Users,
  FileText,
  Link,
  Unlink,
  Play,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

function GovernmentIntegrations() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [configData, setConfigData] = useState({
    apiEndpoint: '',
    clientId: '',
    clientSecret: '',
    oauthToken: '••••••••••••••••'
  });
  const [syncing, setSyncing] = useState(null);
  const [testing, setTesting] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [integrationsRes, statsRes, healthRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/stats'),
        api.get('/integrations/health')
      ]);
      setIntegrations(integrationsRes.data.integrations || []);
      setStats(statsRes.data.stats || {});
      setHealthData(healthRes.data.data || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load integration data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id) => {
    setTesting(id);
    try {
      const response = await api.post(`/integrations/${id}/test`);
      if (response.data.success) {
        toast.success('Connection test successful');
        fetchData();
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (id) => {
    setSyncing(id);
    try {
      const response = await api.post(`/integrations/${id}/sync`);
      if (response.data.success) {
        toast.success('Sync completed successfully');
        fetchData();
      } else {
        toast.error('Sync failed');
      }
    } catch (error) {
      toast.error('Failed to sync');
    } finally {
      setSyncing(null);
    }
  };

  const handleViewLogs = async (id) => {
    try {
      const response = await api.get(`/integrations/${id}/logs`);
      setLogs(response.data.logs || []);
      setSelectedIntegration(integrations.find(i => i.id === id));
      setShowLogsModal(true);
    } catch (error) {
      toast.error('Failed to load logs');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.put(`/integrations/${selectedIntegration.id}/config`, {
        configuration: configData
      });
      toast.success('Configuration updated');
      setShowConfigModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'connected') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'disconnected') return <XCircle className="w-5 h-5 text-gray-400" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      connected: 'badge-success',
      disconnected: 'badge-muted',
      error: 'badge-warning'
    };
    return badges[status] || 'badge-muted';
  };

  const getHealthBadge = (health) => {
    const badges = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return badges[health] || 'bg-gray-100 text-gray-800';
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      sevispass: Shield,
      seviswallet: Wallet,
      sevisdex: Database,
      civil_registry: Building,
      dlpp: Landmark,
      ipa: Briefcase,
      mvil: Car,
      banking: Banknote
    };
    const Icon = icons[serviceType] || Database;
    return Icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Government Integrations</h1>
          <p className="text-kastom-muted mt-1">Manage and monitor all government service integrations</p>
        </div>
        <button 
          onClick={fetchData}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Integrations</p>
              <p className="text-2xl font-bold text-kastom-dark mt-1">{stats?.totalIntegrations || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Connected</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats?.connected || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Disconnected</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats?.disconnected || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Error</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats?.error || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Health Dashboard */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-kastom-green" />
          Connection Health
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthData.map((item) => {
            const Icon = getServiceIcon(item.name.toLowerCase().replace(/\s/g, '_'));
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <Icon className="w-4 h-4 text-kastom-dark" />
                  </div>
                  <div>
                    <p className="font-medium text-kastom-dark text-sm">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getHealthBadge(item.health)} text-xs`}>
                        {item.health || 'Unknown'}
                      </span>
                      <span className="text-xs text-kastom-muted">{item.uptime || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${getStatusBadge(item.status)} text-xs`}>
                    {item.status}
                  </span>
                  <p className="text-xs text-kastom-muted/60 mt-1">{item.usersConnected} users</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = getServiceIcon(integration.serviceType);
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-kastom-cream flex items-center justify-center">
                    <Icon className="w-6 h-6 text-kastom-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-kastom-dark">{integration.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${getStatusBadge(integration.connectionStatus)}`}>
                        {integration.connectionStatus}
                      </span>
                      <span className="badge badge-muted text-xs">v{integration.apiVersion}</span>
                      <span className="badge badge-muted text-xs">{integration.environment}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={testing === integration.id}
                    className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="Test Connection"
                  >
                    {testing === integration.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-kastom-green" />
                    ) : (
                      <Play className="w-4 h-4 text-kastom-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSync(integration.id)}
                    disabled={syncing === integration.id}
                    className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="Sync"
                  >
                    {syncing === integration.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-kastom-green" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-kastom-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIntegration(integration);
                      setConfigData({
                        apiEndpoint: integration.configuration?.apiEndpoint || `https://api.${integration.serviceType}.gov.pg/v1`,
                        clientId: integration.configuration?.clientId || `CLIENT-${integration.serviceType.toUpperCase()}-001`,
                        clientSecret: integration.configuration?.clientSecret || '••••••••••••••••',
                        oauthToken: integration.configuration?.oauthToken || '••••••••••••••••'
                      });
                      setShowConfigModal(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4 text-kastom-muted" />
                  </button>
                  <button
                    onClick={() => handleViewLogs(integration.id)}
                    className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="View Logs"
                  >
                    <Eye className="w-4 h-4 text-kastom-muted" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-kastom-muted">
                <span>Health: <span className={`font-medium ${integration.healthStatus === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {integration.healthStatus || 'Unknown'}
                </span></span>
                <span>•</span>
                <span>Last Sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}</span>
              </div>

              {integration.lastSyncStatus && (
                <div className="mt-2 text-xs">
                  <span className={integration.lastSyncStatus === 'success' ? 'text-green-600' : 'text-red-600'}>
                    Last sync: {integration.lastSyncStatus}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Config Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">Configure {selectedIntegration.name}</h2>
              <button onClick={() => setShowConfigModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream">
                <XCircle className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">API Endpoint</label>
                <input
                  type="text"
                  value={configData.apiEndpoint}
                  onChange={(e) => setConfigData({ ...configData, apiEndpoint: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Client ID</label>
                <input
                  type="text"
                  value={configData.clientId}
                  onChange={(e) => setConfigData({ ...configData, clientId: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Client Secret</label>
                <input
                  type="password"
                  value={configData.clientSecret}
                  onChange={(e) => setConfigData({ ...configData, clientSecret: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">OAuth Token</label>
                <input
                  type="password"
                  value={configData.oauthToken}
                  onChange={(e) => setConfigData({ ...configData, oauthToken: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-sm text-kastom-muted">Certificate Status: <span className="text-green-600 font-medium">Valid</span></p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveConfig} className="btn-primary flex-1">Save Configuration</button>
              <button onClick={() => setShowConfigModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">Sync Logs - {selectedIntegration.name}</h2>
              <button onClick={() => setShowLogsModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream">
                <XCircle className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-kastom-muted text-center py-8">No logs available</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                    <span className={`badge ${log.status === 'success' ? 'badge-success' : log.status === 'failed' ? 'badge-warning' : 'badge-muted'} flex-shrink-0`}>
                      {log.status}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-kastom-dark">{log.message}</p>
                      <p className="text-xs text-kastom-muted/60">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GovernmentIntegrations;