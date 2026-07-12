import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Package,
  FileText,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

function EstatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estates, setEstates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEstate, setNewEstate] = useState({
    title: '',
    description: ''
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEstate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/estates', newEstate);
      toast.success('Estate created successfully!');
      setShowCreateModal(false);
      setNewEstate({ title: '', description: '' });
      fetchEstates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create estate');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this estate?')) return;
    try {
      await api.delete(`/estates/${id}`);
      toast.success('Estate deleted successfully');
      fetchEstates();
    } catch (error) {
      toast.error('Failed to delete estate');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'DRAFT': 'badge-muted',
      'ACTIVE': 'badge-success',
      'PENDING_WITNESS': 'badge-pending',
      'WITNESS_APPROVED': 'badge-success',
      'FINALISED': 'badge-success',
      'DEATH_VERIFIED': 'badge-warning',
      'EXECUTOR_ACTIVATED': 'badge-success',
      'BENEFICIARIES_NOTIFIED': 'badge-success',
      'COMPLETED': 'badge-success'
    };
    return badges[status] || 'badge-muted';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">My Estates</h1>
          <p className="text-kastom-muted mt-1">Manage your estates and inheritance plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Estate
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {estates.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No estates created</p>
            <p className="text-sm text-kastom-muted/60 mt-1">Start by creating your first estate</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Estate
            </button>
          </div>
        ) : (
          estates.map((estate) => (
            <motion.div
              key={estate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-kastom-dark">{estate.title}</h3>
                  <p className="text-sm text-kastom-muted mt-1 line-clamp-2">
                    {estate.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`badge ${getStatusBadge(estate.status)}`}>
                      {estate.status?.replace(/_/g, ' ') || 'Draft'}
                    </span>
                    <span className="text-xs text-kastom-muted">
                      {estate.assets?.length || 0} assets
                    </span>
                    <span className="text-xs text-kastom-muted">
                      {estate.beneficiaries?.length || 0} beneficiaries
                    </span>
                    <span className="text-xs text-kastom-muted">
                      {estate.completionPercentage || 0}% complete
                    </span>
                  </div>
                  <p className="text-xs text-kastom-muted/60 mt-2">
                    Updated {formatDate(estate.updatedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/estate/${estate.id}`)}
                    className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-kastom-muted" />
                  </button>
                  <button 
                    onClick={() => navigate(`/estate/edit/${estate.id}`)}
                    className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-kastom-muted" />
                  </button>
                  <button 
                    onClick={() => handleDelete(estate.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-kastom-danger" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Create New Estate</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateEstate}>
              <div className="mb-4">
                <label className="input-label">Estate Title *</label>
                <input
                  type="text"
                  value={newEstate.title}
                  onChange={(e) => setNewEstate({ ...newEstate, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Kasi Family Estate"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="input-label">Description</label>
                <textarea
                  value={newEstate.description}
                  onChange={(e) => setNewEstate({ ...newEstate, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Describe your estate..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Estate'
                  )}
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

export default EstatePage;