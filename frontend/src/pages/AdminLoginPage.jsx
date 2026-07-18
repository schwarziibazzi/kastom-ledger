import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  ArrowRight, 
  XCircle,
  Fingerprint,
  Server,
  Users,
  Database,
  Activity,
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminLoginPage() {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Admin credentials for demo
  // In production, this would be a real authentication flow
  const adminCredentials = {
    uid: 'MOCK-UID-005',
    password: 'admin123'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowError(false);
    setLoading(true);

    // Validate admin credentials
    if (uid !== adminCredentials.uid || password !== adminCredentials.password) {
      setShowError(true);
      toast.error('Invalid admin credentials');
      setLoading(false);
      return;
    }

    try {
      const result = await login(uid);
      if (result.success && result.user.role === 'ADMINISTRATOR') {
        toast.success('Welcome Administrator');
        navigate('/admin');
      } else {
        setShowError(true);
        toast.error('Admin access denied. User does not have administrator privileges.');
      }
    } catch (error) {
      setShowError(true);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo stats for the login page
  const stats = [
    { label: 'System Status', value: 'Online', icon: Activity, color: 'text-green-400' },
    { label: 'Active Users', value: '1,284', icon: Users, color: 'text-blue-400' },
    { label: 'Integrations', value: '8', icon: Database, color: 'text-purple-400' },
    { label: 'Estates', value: '342', icon: Server, color: 'text-yellow-400' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Admin Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-600/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Administrator Portal</h1>
          <p className="text-gray-400 mt-2">Secure system administration access</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium border border-red-500/30">
            <AlertTriangle className="w-4 h-4" />
            Restricted Access - Authorized Personnel Only
          </div>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Admin Authentication</h2>
              <p className="text-sm text-gray-400">Enter your administrator credentials</p>
            </div>
          </div>

          {/* Error Message */}
          {showError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Authentication Failed</p>
                <p className="text-red-400/70 text-xs">Invalid UID or password. Please try again.</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin UID
              </label>
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => {
                    setUid(e.target.value);
                    setShowError(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter admin UID"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowError(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Access Admin Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">Demo UID:</span>
                <span className="text-white font-mono ml-1">MOCK-UID-005</span>
              </div>
              <div className="p-2 bg-gray-700/50 rounded-lg">
                <span className="text-gray-400">Demo Password:</span>
                <span className="text-white font-mono ml-1">admin123</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              This portal is for authorized administrators only.
              <br />
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </motion.div>

        {/* System Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-center">
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Return to Main Site
          </Link>
          <p className="text-xs text-gray-600 mt-2">
            Protected by military-grade encryption • All access is audited
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminLoginPage;