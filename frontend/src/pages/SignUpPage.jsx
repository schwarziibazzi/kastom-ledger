import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Shield, 
  User, 
  MapPin, 
  Phone, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Circle,
  Upload,
  Camera,
  Users,
  UserCheck,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sevispassUid: 'MOCK-UID-001',
    name: 'John Kasi',
    dateOfBirth: '1985-06-15',
    province: 'National Capital District',
    phone: '675 7123 4567',
    occupation: 'Community Leader',
    role: 'OWNER',
    profilePhoto: null
  });

  const roles = [
    { 
      value: 'OWNER', 
      label: 'Inheritance Owner', 
      description: 'Create and manage your estate and inheritance',
      icon: Shield
    },
    { 
      value: 'BENEFICIARY', 
      label: 'Beneficiary / Heir', 
      description: 'View inherited information and assets assigned to you',
      icon: Gift
    },
    { 
      value: 'WITNESS', 
      label: 'Witness', 
      description: 'Verify and approve inheritance requests',
      icon: UserCheck
    }
  ];

  const provinces = [
    'National Capital District',
    'Morobe Province',
    'Eastern Highlands Province',
    'West New Britain Province',
    'East New Britain Province',
    'Madang Province',
    'Western Highlands Province',
    'Southern Highlands Province',
    'Enga Province',
    'Chimbu Province',
    'Oro Province',
    'Milne Bay Province',
    'Gulf Province',
    'Western Province',
    'Manus Province',
    'New Ireland Province',
    'Bougainville',
    'Central Province'
  ];

  const mockUsers = [
    { uid: 'MOCK-UID-001', name: 'John Kasi', province: 'National Capital District' },
    { uid: 'MOCK-UID-002', name: 'Mary Wama', province: 'Morobe Province' },
    { uid: 'MOCK-UID-003', name: 'Peter Tau', province: 'Eastern Highlands Province' },
    { uid: 'MOCK-UID-004', name: 'Sarah Kila', province: 'West New Britain Province' }
  ];

  const handleNext = () => {
    if (step === 1 && !formData.sevispassUid) {
      toast.error('Please select a SevisPass account');
      return;
    }
    if (step === 2 && !formData.role) {
      toast.error('Please select a role');
      return;
    }
    if (step === 3 && !formData.province) {
      toast.error('Please complete your profile');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signup(formData);
      if (result.success) {
        toast.success(`Welcome, ${result.user.name}!`);
        const role = result.user.role || formData.role;
        switch(role) {
          case 'BENEFICIARY':
            navigate('/my-estates');
            break;
          case 'WITNESS':
            navigate('/witness-dashboard');
            break;
          case 'ADMINISTRATOR':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-kastom-dark">SevisPass Authentication</h2>
            <p className="text-sm text-kastom-muted">Select your SevisPass account to begin</p>

            <div className="space-y-3">
              {mockUsers.map((user) => (
                <label
                  key={user.uid}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${formData.sevispassUid === user.uid
                      ? 'border-kastom-green bg-kastom-green-bg ring-2 ring-kastom-green/20'
                      : 'border-kastom-border hover:border-kastom-green/30 hover:bg-kastom-cream'
                    }`}
                >
                  <input
                    type="radio"
                    name="sevispassUid"
                    value={user.uid}
                    checked={formData.sevispassUid === user.uid}
                    onChange={(e) => {
                      const selectedUser = mockUsers.find(u => u.uid === e.target.value);
                      setFormData({ 
                        ...formData, 
                        sevispassUid: e.target.value, 
                        name: selectedUser?.name || '',
                        province: selectedUser?.province || ''
                      });
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1 gap-3">
                    <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-kastom-green" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-kastom-dark">{user.name}</p>
                      <p className="text-sm text-kastom-muted">{user.province}</p>
                    </div>
                    {formData.sevispassUid === user.uid && (
                      <CheckCircle className="w-5 h-5 text-kastom-green flex-shrink-0" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-kastom-dark">Choose Your Role</h2>
            <p className="text-sm text-kastom-muted">Select how you'll use Kastom Ledger</p>

            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <label
                    key={role.value}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                      ${formData.role === role.value
                        ? 'border-kastom-green bg-kastom-green-bg ring-2 ring-kastom-green/20'
                        : 'border-kastom-border hover:border-kastom-green/30 hover:bg-kastom-cream'
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex items-center flex-1 gap-3">
                      <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-kastom-green" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-kastom-dark">{role.label}</p>
                        <p className="text-sm text-kastom-muted">{role.description}</p>
                      </div>
                      {formData.role === role.value && (
                        <CheckCircle className="w-5 h-5 text-kastom-green flex-shrink-0" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-kastom-dark">Complete Your Profile</h2>
            <p className="text-sm text-kastom-muted">Tell us more about yourself</p>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-kastom-cream border-2 border-kastom-border flex items-center justify-center overflow-hidden">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-kastom-muted" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-kastom-green rounded-full cursor-pointer hover:bg-kastom-green-light transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="John Kasi"
                  required
                />
              </div>

              <div>
                <label className="input-label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="input-label">Province *</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select your province</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="675 7123 4567"
                />
              </div>

              <div>
                <label className="input-label">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="input-field"
                  placeholder="Community Leader"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-kastom-green/10 flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-kastom-green" />
            </div>
            <h2 className="text-2xl font-bold text-kastom-dark">Almost There!</h2>
            <p className="text-kastom-muted">Review your information before creating your account</p>

            <div className="text-left space-y-3 bg-kastom-cream rounded-xl p-6">
              <div className="flex justify-between py-2 border-b border-kastom-border/50">
                <span className="text-kastom-muted">Name</span>
                <span className="font-medium text-kastom-dark">{formData.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-kastom-border/50">
                <span className="text-kastom-muted">Role</span>
                <span className="font-medium text-kastom-dark">
                  {roles.find(r => r.value === formData.role)?.label || formData.role}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-kastom-border/50">
                <span className="text-kastom-muted">Province</span>
                <span className="font-medium text-kastom-dark">{formData.province}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-kastom-muted">SevisPass UID</span>
                <span className="font-medium text-kastom-dark font-mono">{formData.sevispassUid}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-primary inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kastom-cream to-white px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-kastom-green flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Create Account</h1>
          <p className="text-kastom-muted mt-2">Join Kastom Ledger</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${s <= step ? 'bg-kastom-green text-white' : 'bg-kastom-cream text-kastom-muted'}
                  ${s === step ? 'ring-4 ring-kastom-green/20' : ''}
                `}>
                  {s < step ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                {s < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${s < step ? 'bg-kastom-green' : 'bg-kastom-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="card shadow-premium-lg">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-kastom-border/50">
            <button
              onClick={handleBack}
              className={`btn-secondary ${step === 1 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="btn-primary inline-flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-kastom-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-kastom-green hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpPage;