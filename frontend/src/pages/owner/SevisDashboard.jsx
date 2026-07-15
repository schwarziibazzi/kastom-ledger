import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Wallet, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Key,
  Fingerprint,
  Lock,
  UserCheck,
  AlertCircle,
  Plus,
  Send,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

function SevisDashboard() {
  const { user } = useAuth();
  const { isOwner } = useRole();
  const [loading, setLoading] = useState(true);
  const [walletContents, setWalletContents] = useState(null);
  const [peerRequests, setPeerRequests] = useState([]);
  const [showInitWallet, setShowInitWallet] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    responderId: '',
    requestType: 'identity_verification',
    requestData: {}
  });

  useEffect(() => {
    if (!isOwner) return;
    fetchSevisData();
  }, [isOwner]);

  const fetchSevisData = async () => {
    setLoading(true);
    try {
      // Get wallet contents
      const walletRes = await api.get('/sevis/wallet');
      setWalletContents(walletRes.data.wallet);

      // Get peer requests
      const requestsRes = await api.get('/sevis/requests');
      setPeerRequests(requestsRes.data.requests || []);

    } catch (error) {
      console.error('Fetch Sevis data error:', error);
      toast.error('Failed to load Sevis ecosystem data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitWallet = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      const response = await api.post('/sevis/wallet/init', { phoneNumber });
      toast.success('SevisWallet initialized! Your DID has been generated.');
      setShowInitWallet(false);
      fetchSevisData();
    } catch (error) {
      toast.error('Failed to initialize wallet');
    }
  };

  const handleRequestData = async () => {
    if (!requestData.responderId) {
      toast.error('Please select a user');
      return;
    }

    try {
      const response = await api.post('/sevis/data/request', {
        responderId: requestData.responderId,
        requestType: requestData.requestType,
        requestData: requestData.requestData
      });
      toast.success('Data request sent! The wallet owner will review it.');
      setShowRequestModal(false);
      fetchSevisData();
    } catch (error) {
      toast.error('Failed to send data request');
    }
  };

  const handleApproveRequest = async (requestId, approved) => {
    try {
      const response = await api.post(`/sevis/data/respond/${requestId}`, {
        approved,
        responseData: approved ? { approved: true, data: 'Shared from wallet' } : null
      });
      toast.success(approved ? 'Data request approved' : 'Data request rejected');
      fetchSevisData();
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Sevis Ecosystem</h1>
        <p className="text-kastom-muted mt-1">Your decentralized SevisWallet, SevisPass DID, and SevisDEx P2P bridge</p>
      </div>

      {/* Sevis Ecosystem Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* SevisWallet - The Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-hover border-l-4 border-blue-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-kastom-dark">SevisWallet</h3>
              </div>
              {walletContents?.installed ? (
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-kastom-muted">Phone: <span className="font-mono text-kastom-dark">{walletContents.phone}</span></p>
                  <p className="text-kastom-muted">Status: <span className="text-green-600 font-medium">Installed ✓</span></p>
                  <p className="text-kastom-muted">Credentials: <span className="text-kastom-dark font-medium">{walletContents.credentials?.length || 0}</span></p>
                  <p className="text-kastom-muted">Last Sync: {walletContents.lastSync ? new Date(walletContents.lastSync).toLocaleDateString() : 'Never'}</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-kastom-muted text-sm">SevisWallet is not installed on this device.</p>
                  <button 
                    onClick={() => setShowInitWallet(true)}
                    className="mt-3 btn-primary text-sm px-4 py-2 inline-flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Install Wallet
                  </button>
                </div>
              )}
            </div>
            <span className={`badge ${walletContents?.installed ? 'badge-success' : 'badge-pending'}`}>
              {walletContents?.installed ? 'Installed' : 'Not Installed'}
            </span>
          </div>
        </motion.div>

        {/* SevisPass - The DID */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card card-hover border-l-4 border-green-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-kastom-dark">SevisPass</h3>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-kastom-muted">DID: <span className="font-mono text-xs text-kastom-dark">{user?.sevisDid || 'Not generated'}</span></p>
                <p className="text-kastom-muted">UID: <span className="font-mono text-kastom-dark">{user?.sevispassUid}</span></p>
                <p className="text-kastom-muted">Tier: <span className="font-medium text-kastom-dark">{user?.sevisPassTier || 'Tier-1'}</span></p>
                <p className="text-kastom-muted">Status: <span className="text-green-600 font-medium">Verified ✓</span></p>
              </div>
            </div>
            <span className="badge badge-success flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
        </motion.div>

        {/* SevisDEx - The P2P Bridge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card card-hover border-l-4 border-purple-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-kastom-dark">SevisDEx</h3>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-kastom-muted">Status: <span className="text-green-600 font-medium">Active</span></p>
                <p className="text-kastom-muted">P2P Requests: <span className="text-kastom-dark font-medium">{peerRequests.length}</span></p>
                <p className="text-kastom-muted">Bridge Type: <span className="text-kastom-dark font-medium">Peer-to-Peer</span></p>
                <p className="text-kastom-muted">Encryption: <span className="text-kastom-dark font-medium">End-to-End</span></p>
              </div>
            </div>
            <span className="badge badge-success flex items-center gap-1">
              <Database className="w-3 h-3" />
              Connected
            </span>
          </div>
        </motion.div>
      </div>

      {/* Wallet Credentials */}
      {walletContents?.credentials && walletContents.credentials.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Wallet Credentials
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {walletContents.credentials.map((cred, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div>
                  <p className="font-medium text-kastom-dark text-sm">{cred.type}</p>
                  <p className="text-xs text-kastom-muted">Issuer: {cred.issuer}</p>
                  <p className="text-xs text-kastom-muted/60">Issued: {new Date(cred.issuedAt).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* P2P Data Requests */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-kastom-dark flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" />
            P2P Data Requests
          </h2>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Request Data
          </button>
        </div>

        {peerRequests.length === 0 ? (
          <p className="text-kastom-muted text-center py-8">No peer-to-peer data requests</p>
        ) : (
          <div className="space-y-3">
            {peerRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div>
                  <p className="font-medium text-kastom-dark text-sm">{request.requestType}</p>
                  <p className="text-xs text-kastom-muted">
                    From: {request.requester?.name} → To: {request.responder?.name}
                  </p>
                  <p className="text-xs text-kastom-muted/60">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.status === 'pending' && request.responderId === user?.id && (
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => handleApproveRequest(request.id, true)}
                        className="btn-primary text-xs px-3 py-1 inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleApproveRequest(request.id, false)}
                        className="btn-secondary text-xs px-3 py-1 inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                  {request.sevisDexReference && (
                    <span className="text-xs text-kastom-muted/60 font-mono">
                      {request.sevisDexReference.substring(0, 12)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Initialize Wallet Modal */}
      {showInitWallet && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-kastom-dark mb-4">Install SevisWallet</h2>
            <p className="text-sm text-kastom-muted mb-4">
              SevisWallet is a secure app on your phone that stores your SevisPass and other credentials.
              It does not have an ID - it's bound to your phone number.
            </p>
            <div className="mb-4">
              <label className="input-label">Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-field"
                placeholder="675 7123 4567"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleInitWallet} className="btn-primary flex-1">
                Install Wallet
              </button>
              <button onClick={() => setShowInitWallet(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Data Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-kastom-dark mb-4">Request Peer Data</h2>
            <p className="text-sm text-kastom-muted mb-4">
              Send a P2P data request to another user's SevisWallet. They will approve or reject it.
            </p>
            <div className="mb-4">
              <label className="input-label">Responder (Wallet Owner)</label>
              <input
                type="text"
                value={requestData.responderId}
                onChange={(e) => setRequestData({ ...requestData, responderId: e.target.value })}
                className="input-field"
                placeholder="User ID or UID"
              />
            </div>
            <div className="mb-4">
              <label className="input-label">Request Type</label>
              <select
                value={requestData.requestType}
                onChange={(e) => setRequestData({ ...requestData, requestType: e.target.value })}
                className="input-field"
              >
                <option value="identity_verification">Identity Verification</option>
                <option value="estate_verification">Estate Verification</option>
                <option value="asset_verification">Asset Verification</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={handleRequestData} className="btn-primary flex-1">
                Send Request
              </button>
              <button onClick={() => setShowRequestModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SevisDashboard;