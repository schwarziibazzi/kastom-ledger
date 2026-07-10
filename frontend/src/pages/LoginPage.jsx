import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Shield, User, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('MOCK-UID-001');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const mockUsers = [
    { uid: 'MOCK-UID-001', name: 'John Kasi', province: 'National Capital District' },
    { uid: 'MOCK-UID-002', name: 'Mary Wama', province: 'Morobe Province' },
    { uid: 'MOCK-UID-003', name: 'Peter Tau', province: 'Eastern Highlands Province' },
    { uid: 'MOCK-UID-004', name: 'Sarah Kila', province: 'West New Britain Province' },
    { uid: 'MOCK-UID-005', name: 'Admin User', province: 'National Capital District' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(selectedUser);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}`);
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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
            SevisPass Verified
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
                {mockUsers.map((user) => (
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
                        <p className="font-medium text-kastom-dark">{user.name}</p>
                        <p className="text-sm text-kastom-muted truncate">{user.province}</p>
                      </div>
                      {selectedUser === user.uid && (
                        <CheckCircle className="w-5 h-5 text-kastom-green flex-shrink-0" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

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
                  Continue with SevisPass
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

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