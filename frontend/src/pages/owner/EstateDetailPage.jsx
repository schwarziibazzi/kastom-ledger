import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Home, 
  Package, 
  Users, 
  FileText, 
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

function EstateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);

  useEffect(() => {
    fetchEstate();
  }, [id]);

  const fetchEstate = async () => {
    try {
      const response = await api.get(`/estates/${id}`);
      setEstate(response.data.estate);
    } catch (error) {
      console.error('Fetch estate error:', error);
      toast.error('Failed to load estate');
      navigate('/estate');
    } finally {
      setLoading(false);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'long',
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

  if (!estate) {
    return (
      <div className="text-center py-16">
        <p className="text-kastom-muted font-medium">Estate not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/estate')}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Estates
      </button>

      {/* Estate Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">{estate.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`badge ${getStatusBadge(estate.status)}`}>
                {estate.status?.replace(/_/g, ' ') || 'Draft'}
              </span>
              <span className="text-sm text-kastom-muted">
                {estate.assets?.length || 0} assets
              </span>
              <span className="text-sm text-kastom-muted">
                {estate.beneficiaries?.length || 0} beneficiaries
              </span>
              <span className="text-sm text-kastom-muted">
                {estate.completionPercentage || 0}% complete
              </span>
            </div>
            {estate.description && (
              <p className="text-kastom-muted mt-4 leading-relaxed">{estate.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-kastom-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(estate.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated: {formatDate(estate.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/estate/edit/${estate.id}`)}
              className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              title="Edit Estate"
            >
              <Edit className="w-5 h-5 text-kastom-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Assets</p>
              <p className="text-2xl font-bold text-kastom-dark">{estate.assets?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <Package className="w-5 h-5 text-kastom-green" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Beneficiaries</p>
              <p className="text-2xl font-bold text-kastom-dark">{estate.beneficiaries?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Witnesses</p>
              <p className="text-2xl font-bold text-kastom-dark">{estate.witnesses?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Documents</p>
              <p className="text-2xl font-bold text-kastom-dark">{estate.documents?.length || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assets */}
      {estate.assets?.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-kastom-green" />
            Assets
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {estate.assets.map((asset) => (
              <Link 
                key={asset.id} 
                to={`/assets/${asset.id}`}
                className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center">
                  <Package className="w-5 h-5 text-kastom-green" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-kastom-dark text-sm">{asset.title}</p>
                  <p className="text-xs text-kastom-muted">{asset.type}</p>
                </div>
                {asset.estimatedValue && (
                  <span className="text-sm font-medium text-kastom-green">
                    PGK {asset.estimatedValue.toLocaleString()}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Beneficiaries */}
      {estate.beneficiaries?.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-kastom-green" />
            Beneficiaries
          </h2>
          <div className="space-y-2">
            {estate.beneficiaries.map((beneficiary) => (
              <Link 
                key={beneficiary.id} 
                to={`/beneficiaries/${beneficiary.id}`}
                className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-kastom-green" />
                  </div>
                  <div>
                    <p className="font-medium text-kastom-dark">{beneficiary.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-kastom-muted">{beneficiary.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {beneficiary.sharePercentage && (
                    <span className="text-sm font-medium">{beneficiary.sharePercentage}%</span>
                  )}
                  <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                    {beneficiary.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Witnesses */}
      {estate.witnesses?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-kastom-green" />
            Witnesses
          </h2>
          <div className="space-y-2">
            {estate.witnesses.map((witness) => (
              <div key={witness.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div>
                  <p className="font-medium text-kastom-dark">{witness.witness?.name || 'Unknown'}</p>
                  <p className="text-sm text-kastom-muted">Status: {witness.status}</p>
                </div>
                <span className={`badge ${witness.status === 'verified' ? 'badge-success' : 'badge-pending'}`}>
                  {witness.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EstateDetailPage;