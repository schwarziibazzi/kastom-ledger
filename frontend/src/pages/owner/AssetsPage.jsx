import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Home,
  Car,
  Landmark,
  Building,
  PiggyBank,
  Coins,
  FileText,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

function AssetsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [estates, setEstates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    estateId: '',
    type: 'HOUSE',
    title: '',
    description: '',
    estimatedValue: '',
    location: ''
  });

  const assetTypes = [
    { value: 'HOUSE', icon: Home, label: 'House' },
    { value: 'LAND', icon: Landmark, label: 'Land' },
    { value: 'VEHICLE', icon: Car, label: 'Vehicle' },
    { value: 'BUSINESS', icon: Building, label: 'Business' },
    { value: 'LIVESTOCK', icon: PiggyBank, label: 'Livestock' },
    { value: 'SAVINGS', icon: Coins, label: 'Savings' },
    { value: 'INVESTMENT', icon: Coins, label: 'Investment' },
    { value: 'SHARES', icon: Coins, label: 'Shares' },
    { value: 'DIGITAL_ASSETS', icon: Package, label: 'Digital Assets' },
    { value: 'FAMILY_HEIRLOOM', icon: Package, label: 'Family Heirloom' },
    { value: 'DOCUMENTS', icon: FileText, label: 'Documents' },
    { value: 'OTHER', icon: Package, label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assetsRes, estatesRes] = await Promise.all([
        api.get('/assets'),
        api.get('/estates')
      ]);
      setAssets(assetsRes.data.assets || []);
      setEstates(estatesRes.data.estates || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assets', newAsset);
      toast.success('Asset created successfully!');
      setShowCreateModal(false);
      setNewAsset({
        estateId: '',
        type: 'HOUSE',
        title: '',
        description: '',
        estimatedValue: '',
        location: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const found = assetTypes.find(t => t.value === type);
    return found?.icon || Package;
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0
    }).format(value);
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
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Asset Registry</h1>
          <p className="text-kastom-muted mt-1">Manage all your assets and properties</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No assets added</p>
          <p className="text-sm text-kastom-muted/60 mt-1">Start by adding your first asset</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const Icon = getTypeIcon(asset.type);
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card card-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-kastom-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-kastom-dark">{asset.title}</h4>
                      <p className="text-sm text-kastom-muted">{asset.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors">
                      <Eye className="w-4 h-4 text-kastom-muted" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors">
                      <Edit className="w-4 h-4 text-kastom-muted" />
                    </button>
                  </div>
                </div>
                {asset.description && (
                  <p className="text-sm text-kastom-muted mt-2 line-clamp-2">
                    {asset.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {asset.estimatedValue && (
                    <span className="text-sm font-medium text-kastom-green">
                      {formatCurrency(asset.estimatedValue)}
                    </span>
                  )}
                  {asset.location && (
                    <span className="text-xs text-kastom-muted">{asset.location}</span>
                  )}
                </div>
                {asset.estate && (
                  <p className="text-xs text-kastom-muted/60 mt-2">
                    Estate: {asset.estate.title}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Add New Asset</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="mb-4">
                <label className="input-label">Estate *</label>
                <select
                  value={newAsset.estateId}
                  onChange={(e) => setNewAsset({ ...newAsset, estateId: e.target.value })}
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
                <label className="input-label">Asset Type *</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  className="input-field"
                  required
                >
                  {assetTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="input-label">Title *</label>
                <input
                  type="text"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Kasi Family Home"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="input-label">Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="Describe your asset..."
                />
              </div>

              <div className="mb-4">
                <label className="input-label">Estimated Value (PGK)</label>
                <input
                  type="number"
                  value={newAsset.estimatedValue}
                  onChange={(e) => setNewAsset({ ...newAsset, estimatedValue: e.target.value })}
                  className="input-field"
                  placeholder="100000"
                />
              </div>

              <div className="mb-6">
                <label className="input-label">Location</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Port Moresby, NCD"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Adding...' : 'Add Asset'}
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

export default AssetsPage;