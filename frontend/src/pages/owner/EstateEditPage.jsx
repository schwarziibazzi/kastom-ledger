import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

function EstateEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: ''
  });

  useEffect(() => {
    fetchEstate();
  }, [id]);

  const fetchEstate = async () => {
    try {
      const response = await api.get(`/estates/${id}`);
      const estate = response.data.estate;
      setFormData({
        title: estate.title || '',
        description: estate.description || '',
        status: estate.status || 'DRAFT'
      });
    } catch (error) {
      console.error('Fetch estate error:', error);
      toast.error('Failed to load estate');
      navigate('/estate');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/estates/${id}`, formData);
      toast.success('Estate updated successfully!');
      navigate(`/estate/${id}`);
    } catch (error) {
      console.error('Update estate error:', error);
      toast.error('Failed to update estate');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    'DRAFT',
    'ACTIVE',
    'PENDING_WITNESS',
    'WITNESS_APPROVED',
    'FINALISED',
    'DEATH_VERIFIED',
    'EXECUTOR_ACTIVATED',
    'BENEFICIARIES_NOTIFIED',
    'COMPLETED'
  ];

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
        onClick={() => navigate(`/estate/${id}`)}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Estate
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-kastom-dark mb-6">Edit Estate</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="input-label">Estate Title *</label>
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
              rows="4"
            />
          </div>

          <div className="mb-6">
            <label className="input-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
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
              onClick={() => navigate(`/estate/${id}`)}
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

export default EstateEditPage;