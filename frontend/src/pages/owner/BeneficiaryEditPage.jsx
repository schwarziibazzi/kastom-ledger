import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

function BeneficiaryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    relationship: '',
    sharePercentage: '',
    status: ''
  });

  useEffect(() => {
    fetchBeneficiary();
  }, [id]);

  const fetchBeneficiary = async () => {
    try {
      const response = await api.get(`/beneficiaries/${id}`);
      const beneficiary = response.data.beneficiary;
      setFormData({
        relationship: beneficiary.relationship || '',
        sharePercentage: beneficiary.sharePercentage || '',
        status: beneficiary.status || 'pending'
      });
    } catch (error) {
      console.error('Fetch beneficiary error:', error);
      toast.error('Failed to load beneficiary');
      navigate('/beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/beneficiaries/${id}`, formData);
      toast.success('Beneficiary updated successfully!');
      navigate(`/beneficiaries/${id}`);
    } catch (error) {
      console.error('Update beneficiary error:', error);
      toast.error('Failed to update beneficiary');
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
        onClick={() => navigate(`/beneficiaries/${id}`)}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Beneficiary
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-kastom-dark mb-6">Edit Beneficiary</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="input-label">Relationship *</label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="input-field"
              placeholder="e.g., Son, Daughter, Elder"
              required
            />
          </div>

          <div className="mb-4">
            <label className="input-label">Share Percentage</label>
            <input
              type="number"
              value={formData.sharePercentage}
              onChange={(e) => setFormData({ ...formData, sharePercentage: e.target.value })}
              className="input-field"
              placeholder="25"
              min="0"
              max="100"
            />
          </div>

          <div className="mb-6">
            <label className="input-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
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
              onClick={() => navigate(`/beneficiaries/${id}`)}
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

export default BeneficiaryEditPage;