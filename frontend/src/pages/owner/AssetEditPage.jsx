import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

function AssetEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    estimatedValue: '',
    location: '',
    status: ''
  });

  const assetTypes = [
    'HOUSE', 'LAND', 'VEHICLE', 'BUSINESS', 'LIVESTOCK', 
    'SAVINGS', 'INVESTMENT', 'SHARES', 'DIGITAL_ASSETS', 
    'FAMILY_HEIRLOOM', 'DOCUMENTS', 'OTHER'
  ];

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await api.get(`/assets/${id}`);
      const asset = response.data.asset;
      setFormData({
        type: asset.type || '',
        title: asset.title || '',
        description: asset.description || '',
        estimatedValue: asset.estimatedValue || '',
        location: asset.location || '',
        status: asset.status || 'active'
      });
    } catch (error) {
      console.error('Fetch asset error:', error);
      toast.error('Failed to load asset');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/assets/${id}`, formData);
      toast.success('Asset updated successfully!');
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('Update asset error:', error);
      toast.error('Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`/assets/${id}`)}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Asset
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-kastom-dark mb-6">Edit Asset</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="input-label">Asset Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select type</option>
              {assetTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="input-label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="input-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="input-label">Estimated Value (PGK)</label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="input-field"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="input-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="Port Moresby, NCD"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="input-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/assets/${id}`)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetEditPage;