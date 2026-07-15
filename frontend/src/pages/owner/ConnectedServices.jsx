import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Wallet, 
  Database, 
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
  Link,
  ExternalLink,
  Import,
  FileText,
  Loader2,
  Smartphone,
  Key,
  Fingerprint,
  UserCheck,
  Gift,
  Home,
  FileCheck,
  Award,
  Globe,
  Lock,
  Unlock,
  Users,
  Eye,
  BarChart3,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function ConnectedServices() {
  const { user } = useAuth();
  const { isOwner } = useRole();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [importing, setImporting] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [estates, setEstates] = useState([]);
  const [selectedEstate, setSelectedEstate] = useState('');
  const [importedAssets, setImportedAssets] = useState([]);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [walletStatus, setWalletStatus] = useState({
    installed: false,
    phone: '',
    credentials: 0,
    lastSync: null
  });
  const [didInfo, setDidInfo] = useState({
    did: '',
    tier: 'Tier-1',
    verified: true
  });

  useEffect(() => {
    if (!isOwner) return;
    fetchData();
  }, [isOwner]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connectionsRes, integrationsRes, estatesRes, walletRes] = await Promise.all([
        api.get('/integrations/user/services'),
        api.get('/integrations'),
        api.get('/estates'),
        api.get('/sevis/wallet').catch(() => ({ data: { wallet: null } }))
      ]);
      
      setConnections(connectionsRes.data.connections || []);
      setIntegrations(integrationsRes.data.integrations || []);
      setEstates(estatesRes.data.estates || []);
      
      if (walletRes.data?.wallet) {
        setWalletStatus({
          installed: walletRes.data.wallet.installed || false,
          phone: walletRes.data.wallet.phone || '',
          credentials: walletRes.data.wallet.credentials?.length || 0,
          lastSync: walletRes.data.wallet.lastSync || null
        });
      }

      // Set DID info from user
      if (user) {
        setDidInfo({
          did: user.sevisDid || `did:sevis:pngext1:${user.sevispassUid}`,
          tier: user.sevisPassTier || 'Tier-1',
          verified: true
        });
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load connected services');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId) => {
    setConnecting(integrationId);
    try {
      await api.post(`/integrations/user/${integrationId}/connect`);
      toast.success('Service connected successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to connect service');
    } finally {
      setConnecting(null);
    }
  };

  const handleImport = async (integrationId) => {
    if (!selectedEstate) {
      toast.error('Please select an estate to import assets into');
      return;
    }

    setImporting(integrationId);
    try {
      const response = await api.post(`/integrations/user/${integrationId}/import`, {
        estateId: selectedEstate
      });
      if (response.data.success) {
        setImportedAssets(response.data.result.assets || []);
        setShowImportSuccess(true);
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to import assets');
    } finally {
      setImporting(null);
      setShowConnectModal(false);
    }
  };

  const handleInstallWallet = async () => {
    try {
      const phone = prompt('Enter your phone number for SevisWallet:', '675 7123 4567');
      if (!phone) return;
      
      await api.post('/sevis/wallet/init', { phoneNumber: phone });
      toast.success('SevisWallet installed successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to install wallet');
    }
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      sevispass: Shield,
      seviswallet: Smartphone,
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

  const getServiceDisplayName = (serviceType) => {
    const names = {
      sevispass: 'Identity Verification',
      seviswallet: 'Digital Wallet',
      sevisdex: 'Data Exchange',
      civil_registry: 'Civil Registry',
      dlpp: 'Land Registry',
      ipa: 'Business Registry',
      mvil: 'Vehicle Registry',
      banking: 'Banking Services'
    };
    return names[serviceType] || serviceType;
  };

  const getServiceDescription = (serviceType) => {
    const descriptions = {
      sevispass: 'Your identity is verified through SevisPass',
      seviswallet: 'Your digital wallet is connected',
      sevisdex: 'Secure data exchange is available',
      civil_registry: 'Used for estate and death verification',
      dlpp: 'Verify and import land titles',
      ipa: 'Verify and import business registrations',
      mvil: 'Verify and import vehicle registrations',
      banking: 'Connect your bank accounts (coming soon)'
    };
    return descriptions[serviceType] || 'Government service integration';
  };

  const getConnectionStatus = (integrationId) => {
    const conn = connections.find(c => c.integrationId === integrationId);
    return conn?.connected || false;
  };

  const getConnectedIntegration = (integrationId) => {
    return connections.find(c => c.integrationId === integrationId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      true: 'badge-success',
      false: 'badge-muted'
    };
    return badges[status] || 'badge-muted';
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Connected Government Services</h1>
        <p className="text-kastom-muted mt-1">Your digital identity and government service connections</p>
      </div>

      {/* SevisPass / DID Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8 border-l-4 border-green-500"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-kastom-dark">Your Digital Identity</h2>
                <p className="text-sm text-kastom-muted">Verified through SevisPass</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">DID (Decentralized ID)</p>
                <p className="font-mono text-sm text-kastom-dark truncate">{didInfo.did}</p>
              </div>
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">Verification Tier</p>
                <p className="font-medium text-kastom-dark">{didInfo.tier}</p>
              </div>
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">Status</p>
                <span className="badge badge-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
          <span className="badge badge-success flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        </div>
      </motion.div>

      {/* SevisWallet Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-8 border-l-4 border-blue-500"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-kastom-dark">SevisWallet</h2>
                <p className="text-sm text-kastom-muted">Your digital wallet on your phone</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">Status</p>
                {walletStatus.installed ? (
                  <span className="badge badge-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Installed
                  </span>
                ) : (
                  <span className="badge badge-pending flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Not Installed
                  </span>
                )}
              </div>
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">Phone</p>
                <p className="font-medium text-kastom-dark">{walletStatus.phone || 'Not set'}</p>
              </div>
              <div className="p-3 bg-kastom-cream rounded-xl">
                <p className="text-xs text-kastom-muted">Credentials</p>
                <p className="font-medium text-kastom-dark">{walletStatus.credentials} stored</p>
              </div>
            </div>
          </div>
          {!walletStatus.installed && (
            <button
              onClick={handleInstallWallet}
              className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install Wallet
            </button>
          )}
        </div>
      </motion.div>

      {/* Service Cards */}
      <h2 className="text-xl font-semibold text-kastom-dark mb-4">Connected Government Services</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = getServiceIcon(integration.serviceType);
          const isConnected = getConnectionStatus(integration.id);
          const conn = getConnectedIntegration(integration.id);
          const displayName = getServiceDisplayName(integration.serviceType);
          const description = getServiceDescription(integration.serviceType);

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-green-50' : 'bg-kastom-cream'}`}>
                    <Icon className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-kastom-muted'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-kastom-dark">{displayName}</h3>
                    <p className="text-sm text-kastom-muted">{description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="badge badge-muted flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                {isConnected ? (
                  <>
                    <span className="text-green-600 font-medium">✓ Active</span>
                    {conn?.assetsImported > 0 && (
                      <span className="text-kastom-muted">{conn.assetsImported} assets imported</span>
                    )}
                    {conn?.lastImportAt && (
                      <span className="text-xs text-kastom-muted/60">
                        Last import: {new Date(conn.lastImportAt).toLocaleDateString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-kastom-muted">Not connected</span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {!isConnected ? (
                  <button
                    onClick={() => {
                      setSelectedService(integration);
                      setShowConnectModal(true);
                    }}
                    disabled={connecting === integration.id}
                    className="btn-primary text-sm px-4 py-2 flex-1 inline-flex items-center justify-center gap-2"
                  >
                    {connecting === integration.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4" />
                    )}
                    Connect Service
                  </button>
                ) : (
                  <>
                    {integration.serviceType === 'dlpp' && (
                      <button
                        onClick={() => {
                          setSelectedService(integration);
                          setShowConnectModal(true);
                        }}
                        className="btn-primary text-sm px-4 py-2 flex-1 inline-flex items-center justify-center gap-2"
                      >
                        <Import className="w-4 h-4" />
                        Import Assets
                      </button>
                    )}
                    <button className="btn-secondary text-sm px-4 py-2 flex-1 inline-flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connect/Import Modal */}
      {showConnectModal && selectedService && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-kastom-dark">
                {getConnectionStatus(selectedService.id) ? `Import Assets from ${selectedService.name}` : `Connect to ${selectedService.name}`}
              </h2>
              <button onClick={() => setShowConnectModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream">
                <XCircle className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>

            {!getConnectionStatus(selectedService.id) ? (
              <div>
                <p className="text-sm text-kastom-muted mb-4">
                  You will be redirected to {selectedService.name} to authorize connection.
                </p>
                <div className="bg-kastom-cream rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-kastom-green" />
                    <span>Your identity will be verified through SevisPass</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Database className="w-4 h-4 text-kastom-green" />
                    <span>Data will be exchanged securely through SevisDEx</span>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(selectedService.id)}
                  disabled={connecting === selectedService.id}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {connecting === selectedService.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link className="w-4 h-4" />
                  )}
                  Connect Now
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-kastom-muted mb-4">
                  Select an estate to import verified assets into.
                </p>
                <div className="mb-4">
                  <label className="input-label">Select Estate</label>
                  <select
                    value={selectedEstate}
                    onChange={(e) => setSelectedEstate(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select an estate</option>
                    {estates.map((estate) => (
                      <option key={estate.id} value={estate.id}>
                        {estate.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Importing assets from {selectedService.name} will create verified asset records in your estate.
                  </p>
                </div>
                <button
                  onClick={() => handleImport(selectedService.id)}
                  disabled={importing === selectedService.id}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {importing === selectedService.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Import className="w-4 h-4" />
                  )}
                  Import Assets
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Success Modal */}
      {showImportSuccess && importedAssets.length > 0 && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="text-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-kastom-dark mt-4">Import Successful!</h2>
              <p className="text-kastom-muted">Successfully imported {importedAssets.length} assets</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {importedAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <FileText className="w-5 h-5 text-kastom-green" />
                  <div className="flex-1">
                    <p className="font-medium text-kastom-dark text-sm">{asset.title}</p>
                    <p className="text-xs text-kastom-muted">{asset.registryAuthority} • {asset.departmentReference}</p>
                  </div>
                  <span className="badge badge-success text-xs">Verified</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowImportSuccess(false);
                  setImportedAssets([]);
                }}
                className="btn-primary flex-1"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setShowImportSuccess(false);
                  setImportedAssets([]);
                  window.location.href = '/assets';
                }}
                className="btn-secondary flex-1"
              >
                View Assets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedServices;