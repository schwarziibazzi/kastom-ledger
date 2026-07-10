import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  User, 
  Users, 
  Package, 
  MessageCircle, 
  UserCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Circle,
  Shield,
  Loader2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DigitalWillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [estates, setEstates] = useState([]);
  const [selectedEstate, setSelectedEstate] = useState(null);
  const [willData, setWillData] = useState({
    estateId: '',
    introduction: '',
    executorNotes: '',
    personalMessages: '',
    witnesses: []
  });

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      const response = await api.get('/estates');
      setEstates(response.data.estates || []);
    } catch (error) {
      console.error('Fetch estates error:', error);
      toast.error('Failed to load estates');
    }
  };

  const handleSubmit = async () => {
    if (!willData.estateId) {
      toast.error('Please select an estate');
      return;
    }
    setLoading(true);
    try {
      await api.post('/will', willData);
      toast.success('Digital Will created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create will');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Introduction', icon: FileText },
    { id: 2, label: 'Executor', icon: User },
    { id: 3, label: 'Assets', icon: Package },
    { id: 4, label: 'Beneficiaries', icon: Users },
    { id: 5, label: 'Messages', icon: MessageCircle },
    { id: 6, label: 'Witnesses', icon: UserCheck }
  ];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="input-label">Select Estate *</label>
              <select
                value={willData.estateId}
                onChange={(e) => {
                  const estate = estates.find(est => est.id === e.target.value);
                  setSelectedEstate(estate);
                  setWillData({ ...willData, estateId: e.target.value });
                }}
                className="input-field"
                required
              >
                <option value="">Select an estate</option>
                {estates.map((estate) => (
                  <option key={estate.id} value={estate.id}>
                    {estate.title} ({estate.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Introduction</label>
              <textarea
                value={willData.introduction}
                onChange={(e) => setWillData({ ...willData, introduction: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Begin your will with a personal introduction..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <label className="input-label">Executor Notes</label>
            <textarea
              value={willData.executorNotes}
              onChange={(e) => setWillData({ ...willData, executorNotes: e.target.value })}
              className="input-field"
              rows="6"
              placeholder="Instructions for your executor..."
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-kastom-muted">Your assets will be listed from your estate</p>
            {selectedEstate?.assets?.length > 0 ? (
              <div className="space-y-2">
                {selectedEstate.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl">
                    <CheckCircle className="w-5 h-5 text-kastom-green" />
                    <div className="flex-1">
                      <p className="font-medium text-kastom-dark">{asset.title}</p>
                      <p className="text-sm text-kastom-muted">{asset.type} • {asset.estimatedValue || 'No value'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-kastom-muted text-center py-8">
                No assets found. Please add assets to your estate first.
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-kastom-muted">Your beneficiaries will be listed from your estate</p>
            {selectedEstate?.beneficiaries?.length > 0 ? (
              <div className="space-y-2">
                {selectedEstate.beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl">
                    <Users className="w-5 h-5 text-kastom-green" />
                    <div className="flex-1">
                      <p className="font-medium text-kastom-dark">{beneficiary.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-kastom-muted">
                        {beneficiary.relationship} • {beneficiary.sharePercentage || 'No percentage'}%
                      </p>
                    </div>
                    <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                      {beneficiary.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-kastom-muted text-center py-8">
                No beneficiaries found. Please add beneficiaries to your estate first.
              </p>
            )}
          </div>
        );

      case 5:
        return (
          <div>
            <label className="input-label">Personal Messages</label>
            <textarea
              value={willData.personalMessages}
              onChange={(e) => setWillData({ ...willData, personalMessages: e.target.value })}
              className="input-field"
              rows="8"
              placeholder="Leave a personal message for your family..."
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-kastom-muted">Add witnesses to verify your will</p>
            <button 
              className="btn-secondary inline-flex items-center gap-2 text-sm w-full justify-center"
              onClick={() => {
                toast.success('Witness added (demo)');
              }}
            >
              <Plus className="w-4 h-4" />
              Add Witness
            </button>
            {willData.witnesses.length === 0 ? (
              <p className="text-kastom-muted text-center py-8">
                No witnesses added yet
              </p>
            ) : (
              <div className="space-y-2">
                {willData.witnesses.map((w, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl">
                    <div>
                      <p className="font-medium text-kastom-dark">{w.name}</p>
                      <p className="text-sm text-kastom-muted">{w.email}</p>
                    </div>
                    <span className="badge badge-pending">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Digital Will</h1>
        <p className="text-kastom-muted mt-1">Create your legally-binding digital will</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isComplete = s.id < step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete ? 'bg-kastom-green text-white' : ''}
                    ${isActive ? 'bg-kastom-green text-white ring-4 ring-kastom-green/20' : ''}
                    ${!isActive && !isComplete ? 'bg-kastom-cream text-kastom-muted' : ''}
                  `}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-sm font-medium hidden md:block
                    ${isActive ? 'text-kastom-dark' : 'text-kastom-muted'}
                  `}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-2
                    ${isComplete ? 'bg-kastom-green' : 'bg-kastom-border'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-kastom-border/50">
          <button
            onClick={() => setStep(step - 1)}
            className={`btn-secondary ${step === 1 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          {step < steps.length ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Submit Will
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DigitalWillPage;