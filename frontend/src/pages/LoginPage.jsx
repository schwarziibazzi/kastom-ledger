import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Shield, 
  User, 
  CheckCircle, 
  ArrowRight, 
  UserCheck, 
  Gift, 
  Crown, 
  QrCode,
  Smartphone,
  LogIn,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeLogin from '../components/QRCodeLogin';

function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('MOCK-UID-001');
  const [loading, setLoading] = useState(false);
  const [showQRLogin, setShowQRLogin] = useState(false);
  const [qrUserId, setQrUserId] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const mockUsers = [
    { uid: 'MOCK-UID-001', name: 'John Kasi', province: 'National Capital District', role: 'OWNER', icon: Crown },
    { uid: 'MOCK-UID-002', name: 'Mary Wama', province: 'Morobe Province', role: 'BENEFICIARY', icon: Gift },
    { uid: 'MOCK-UID-003', name: 'Peter Tau', province: 'Eastern Highlands Province', role: 'WITNESS', icon: UserCheck },
    { uid: 'MOCK-UID-004', name: 'Sarah Kila', province: 'West New Britain Province', role: 'BENEFICIARY', icon: Gift }
  ];

  const roleColors = {
    OWNER: 'text-green-600 bg-green-50',
    BENEFICIARY: 'text-blue-600 bg-blue-50',
    WITNESS: 'text-purple-600 bg-purple-50'
  };

  const roleLabels = {
    OWNER: 'Inheritance Owner',
    BENEFICIARY: 'Beneficiary',
    WITNESS: 'Witness'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(selectedUser);
      if (result.success) {
        const userRole = result.user?.role || 'OWNER';
        toast.success(`Welcome${userRole === 'ADMINISTRATOR' ? ' Admin' : ''}, ${result.user.name}!`);
        
        switch(userRole) {
          case 'ADMINISTRATOR':
            navigate('/admin');
            break;
          case 'BENEFICIARY':
            navigate('/my-estates');
            break;
          case 'WITNESS':
            navigate('/witness-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQRSuccess = (data) => {
    toast.success('Authentication successful!');
    navigate('/dashboard');
  };

  const handleQRError = (error) => {
    toast.error('QR authentication failed');
    setShowQRLogin(false);
  };

  if (showQRLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kastom-cream to-white px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-kastom-green flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">QR Code Login</h1>
            <p className="text-kastom-muted mt-2">Scan with your SevisWallet</p>
            <button
              onClick={() => setShowQRLogin(false)}
              className="mt-4 text-kastom-muted hover:text-kastom-dark text-sm inline-flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Back to regular login
            </button>
          </div>

          <div className="card shadow-premium-lg">
            <QRCodeLogin 
              userId={qrUserId || 'MOCK-UID-001'}
              onSuccess={handleQRSuccess}
              onError={handleQRError}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kastom-cream to-white px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-kastom-green flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Kastom Ledger</h1>
          <p className="text-kastom-muted mt-2">Digital Legacy Preservation Platform</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-kastom-green-bg text-kastom-green px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            SevisPass Enabled
          </div>
        </div>

        {/* Login Card */}
        <div className="card shadow-premium-lg">
          <h2 className="text-xl font-semibold text-kastom-dark text-center mb-6">
            Login with SevisPass
          </h2>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-kastom-dark mb-3">
                Select Your Account
              </label>
              <div className="space-y-2">
                {mockUsers.map((user) => {
                  const RoleIcon = user.icon;
                  return (
                    <label
                      key={user.uid}
                      className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all duration-200
                        ${selectedUser === user.uid
                          ? 'border-kastom-green bg-kastom-green-bg ring-2 ring-kastom-green/20'
                          : 'border-kastom-border hover:border-kastom-green/30 hover:bg-kastom-cream'
                        }`}
                    >
                      <input
                        type="radio"
                        name="sevispassUid"
                        value={user.uid}
                        checked={selectedUser === user.uid}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1 gap-3">
                        <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-kastom-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-kastom-dark">{user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                              <RoleIcon className="w-3 h-3 inline mr-0.5" />
                              {roleLabels[user.role]}
                            </span>
                          </div>
                          <p className="text-sm text-kastom-muted truncate">{user.province}</p>
                        </div>
                        {selectedUser === user.uid && (
                          <CheckCircle className="w-5 h-5 text-kastom-green flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Continue with SevisPass
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* QR Code Login Option */}
              <button
                type="button"
                onClick={() => {
                  setQrUserId(selectedUser);
                  setShowQRLogin(true);
                }}
                className="w-full btn-secondary inline-flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Login with QR Code
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-kastom-border/50">
            <div className="flex items-center gap-2 text-xs text-kastom-muted/60 bg-kastom-cream p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>QR Code login simulates scanning with SevisWallet. Click "Simulate Wallet Scan" after generating.</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-kastom-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-kastom-green hover:underline font-medium">
                Create Account
              </Link>
            </p>
            <p className="text-xs text-kastom-muted/60 mt-4">
              This is a mock SevisPass authentication for demonstration purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;