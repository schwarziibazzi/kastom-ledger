import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  Eye,
  Shield,
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

function Successors() {
  const [successors, setSuccessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSuccessor, setNewSuccessor] = useState({
    successorUid: '',
    relationship: '',
    accessLevel: 'viewer'
  });
  const [mockUsers, setMockUsers] = useState([]);

  useEffect(() => {
    fetchData();
    fetchMockUsers();
  }, []);

  const fetchData = async () => {
    try {
      const [successorsRes] = await Promise.all([
        api.get('/successors')
      ]);
      setSuccessors(successorsRes.data.successors || []);
    } catch (error) {
      console.error('Fetch successors error:', error);
      toast.error('Failed to load successors');
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

  const handleNominate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/successors', newSuccessor);
      toast.success('Successor nominated successfully');
      setShowModal(false);
      setNewSuccessor({ successorUid: '', relationship: '', accessLevel: 'viewer' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to nominate');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_witness': { color: 'badge-pending', icon: Clock, label: 'Pending Witness' },
      'witness_pending': { color: 'badge-warning', icon: Clock, label: 'Witness Pending' },
      'verified': { color: 'badge-success', icon: CheckCircle, label: 'Verified' },
      'active': { color: 'badge-success', icon: CheckCircle, label: 'Active' }
    };
    const badge = badges[status] || { color: 'badge-muted', icon: Clock, label: status };
    return badge;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Successors</h1>
          <p className="text-kastom-muted mt-1">Nominate trusted individuals to carry on your legacy</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nominate Successor
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-kastom-dark">Your Successors</h2>
          <span className="badge badge-muted">{successors.length} nominated</span>
        </div>

        {successors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No successors nominated</p>
            <p className="text-sm text-kastom-muted/60 mt-1">Start by nominating someone you trust</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Nominate Successor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {successors.map((successor) => {
              const badge = getStatusBadge(successor.status);
              const Icon = badge.icon;
              return (
                <motion.div
                  key={successor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-kastom-green/10 flex items-center justify-center">
                      <span className="text-kastom-green font-semibold text-lg">
                        {successor.successor?.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-kastom-dark">
                        {successor.successor?.name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-kastom-muted">
                        <span>{successor.relationship}</span>
                        <span>•</span>
                        <span>{successor.accessLevel} access</span>
                        <span>•</span>
                        <span className="text-xs font-mono">{successor.successor?.sevispassUid}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${badge.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {badge.label}
                    </span>
                    {successor.status === 'pending_witness' && (
                      <button className="text-kastom-green hover:underline text-sm font-medium">
                        Request Witness
                      </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-white transition-colors">
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Nominate Successor</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>

            <form onSubmit={handleNominate}>
              <div className="mb-4">
                <label className="input-label">Select Successor *</label>
                <select
                  value={newSuccessor.successorUid}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, successorUid: e.target.value })}
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
                  value={newSuccessor.relationship}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, relationship: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Son, Daughter, Elder, Friend"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="input-label">Access Level</label>
                <select
                  value={newSuccessor.accessLevel}
                  onChange={(e) => setNewSuccessor({ ...newSuccessor, accessLevel: e.target.value })}
                  className="input-field"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Nominate
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default Successors;