import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  X,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiariesPage() {
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [estates, setEstates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mockUsers, setMockUsers] = useState([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    estateId: '',
    userId: '',
    relationship: '',
    sharePercentage: ''
  });

  useEffect(() => {
    fetchData();
    fetchMockUsers();
  }, []);

  const fetchData = async () => {
    try {
      const [beneficiariesRes, estatesRes] = await Promise.all([
        api.get('/beneficiaries'),
        api.get('/estates')
      ]);
      setBeneficiaries(beneficiariesRes.data.beneficiaries || []);
      setEstates(estatesRes.data.estates || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMockUsers = async () => {
    try {
      const response = await api.get('/auth/mock-users');
      setMockUsers(response.data.users || []);
    } catch (error) {
      console.error('Fetch mock users error:', error);
    }
  };

  const handleCreateBeneficiary = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/beneficiaries', newBeneficiary);
      toast.success('Beneficiary added successfully!');
      setShowCreateModal(false);
      setNewBeneficiary({
        estateId: '',
        userId: '',
        relationship: '',
        sharePercentage: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'accepted': 'badge-success',
      'declined': 'badge-warning'
    };
    return badges[status] || 'badge-muted';
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Beneficiaries</h1>
          <p className="text-kastom-muted mt-1">Manage your estate beneficiaries</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Beneficiary
        </button>
      </div>

      {/* Beneficiaries List */}
      {beneficiaries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No beneficiaries added</p>
          <p className="text-sm text-kastom-muted/60 mt-1">Start by adding beneficiaries to your estate</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Beneficiary
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {beneficiaries.map((beneficiary) => (
            <motion.div
              key={beneficiary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-kastom-green/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-kastom-green" />
                </div>
                <div>
                  <p className="font-semibold text-kastom-dark">
                    {beneficiary.user?.name || 'Unknown'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-kastom-muted">
                    <span>{beneficiary.relationship}</span>
                    <span>•</span>
                    <span>{beneficiary.sharePercentage || 'No'}% share</span>
                    <span>•</span>
                    <span className="text-xs">{beneficiary.estate?.title}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusBadge(beneficiary.status)}`}>
                  {beneficiary.status}
                </span>
                {beneficiary.status === 'pending' && (
                  <button className="text-kastom-green hover:underline text-sm font-medium">
                    Resend Invite
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Add Beneficiary</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateBeneficiary}>
              <div className="mb-4">
                <label className="input-label">Estate *</label>
                <select
                  value={newBeneficiary.estateId}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, estateId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select an estate</option>
                  {estates.map((estate) => (
                    <option key={estate.id} value={estate.id}>
                      {estate.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="input-label">Select User *</label>
                <select
                  value={newBeneficiary.userId}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a user</option>
                  {mockUsers.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.name} ({user.province})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="input-label">Relationship *</label>
                <input
                  type="text"
                  value={newBeneficiary.relationship}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Son, Daughter, Elder"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="input-label">Share Percentage</label>
                <input
                  type="number"
                  value={newBeneficiary.sharePercentage}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, sharePercentage: e.target.value })}
                  className="input-field"
                  placeholder="25"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Adding...' : 'Add Beneficiary'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default BeneficiariesPage;