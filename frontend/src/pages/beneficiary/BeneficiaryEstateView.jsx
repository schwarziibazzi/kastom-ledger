import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Home, 
  Package, 
  Users, 
  FileText,
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryEstateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estate, setEstate] = useState(null);

  useEffect(() => {
    fetchEstate();
  }, [id]);

  const fetchEstate = async () => {
    try {
      // Use the estates endpoint with beneficiary check
      const response = await api.get(`/estates/${id}`);
      setEstate(response.data.estate);
    } catch (error) {
      console.error('Fetch estate error:', error);
      toast.error('Failed to load estate');
      navigate('/my-estates');
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
        onClick={() => navigate('/my-estates')}
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
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${getStatusBadge(estate.status)}`}>
                {estate.status?.replace(/_/g, ' ') || 'Active'}
              </span>
              <span className="text-sm text-kastom-muted">
                Owner: {estate.owner?.name}
              </span>
              <span className="text-sm text-kastom-muted">
                Updated: {formatDate(estate.updatedAt)}
              </span>
              <span className="text-xs text-blue-600 font-medium">View Only</span>
            </div>
            {estate.description && (
              <p className="text-kastom-muted mt-4 leading-relaxed">{estate.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-kastom-green">
            <Eye className="w-4 h-4" />
            <span>View Only</span>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-kastom-green" />
          Assets ({estate.assets?.length || 0})
        </h2>
        {estate.assets?.length === 0 ? (
          <p className="text-kastom-muted text-center py-8">No assets in this estate</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {estate.assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beneficiaries */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-kastom-green" />
          Beneficiaries
        </h2>
        {estate.beneficiaries?.length === 0 ? (
          <p className="text-kastom-muted text-center py-8">No beneficiaries assigned</p>
        ) : (
          <div className="space-y-2">
            {estate.beneficiaries.map((beneficiary) => {
              const isYou = beneficiary.userId === user?.id;
              return (
                <div key={beneficiary.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <div>
                    <p className="font-medium text-kastom-dark">
                      {beneficiary.user?.name || 'Unknown'}
                      {isYou && <span className="text-xs text-blue-600 ml-2">(You)</span>}
                    </p>
                    <p className="text-sm text-kastom-muted">{beneficiary.relationship}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {beneficiary.sharePercentage && (
                      <span className="text-sm font-medium">{beneficiary.sharePercentage}%</span>
                    )}
                    <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                      {beneficiary.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="card">
        <h2 className="text-xl font-semibold text-kastom-dark mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-kastom-green" />
          Documents
        </h2>
        {estate.documents?.length === 0 ? (
          <p className="text-kastom-muted text-center py-8">No documents available</p>
        ) : (
          <div className="space-y-2">
            {estate.documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-kastom-green" />
                  <div>
                    <p className="font-medium text-kastom-dark text-sm">{doc.title}</p>
                    <p className="text-xs text-kastom-muted">{doc.fileType}</p>
                  </div>
                </div>
                <button className="text-kastom-green hover:underline text-sm">View</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BeneficiaryEstateView;