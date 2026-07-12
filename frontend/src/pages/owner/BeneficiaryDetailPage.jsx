import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Users, 
  Mail, 
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Edit
} from 'lucide-react';

function BeneficiaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState(null);

  useEffect(() => {
    fetchBeneficiary();
  }, [id]);

  const fetchBeneficiary = async () => {
    try {
      const response = await api.get(`/beneficiaries/${id}`);
      setBeneficiary(response.data.beneficiary);
    } catch (error) {
      console.error('Fetch beneficiary error:', error);
      toast.error('Failed to load beneficiary');
      navigate('/beneficiaries');
    } finally {
      setLoading(false);
    }
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

  if (!beneficiary) {
    return (
      <div className="text-center py-16">
        <p className="text-kastom-muted font-medium">Beneficiary not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/beneficiaries')}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Beneficiaries
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-kastom-green/10 flex items-center justify-center">
                <User className="w-8 h-8 text-kastom-green" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-kastom-dark">{beneficiary.user?.name || 'Unknown'}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="badge badge-muted">{beneficiary.relationship}</span>
                  <span className={`badge ${beneficiary.status === 'accepted' ? 'badge-success' : 'badge-pending'}`}>
                    {beneficiary.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {beneficiary.user?.sevispassUid && (
                <p className="text-sm text-kastom-muted">
                  UID: {beneficiary.user.sevispassUid}
                </p>
              )}
              {beneficiary.user?.province && (
                <p className="text-sm text-kastom-muted">
                  Province: {beneficiary.user.province}
                </p>
              )}
              {beneficiary.sharePercentage && (
                <p className="text-sm font-medium text-kastom-green">
                  Share: {beneficiary.sharePercentage}%
                </p>
              )}
              {beneficiary.estate && (
                <p className="text-sm text-kastom-muted">
                  Estate: <Link to={`/estate/${beneficiary.estate.id}`} className="text-kastom-green hover:underline">{beneficiary.estate.title}</Link>
                </p>
              )}
              <p className="text-sm text-kastom-muted">
                Invited: {formatDate(beneficiary.invitedAt)}
              </p>
              {beneficiary.acceptedAt && (
                <p className="text-sm text-kastom-muted">
                  Accepted: {formatDate(beneficiary.acceptedAt)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/beneficiaries/edit/${beneficiary.id}`)}
              className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
            >
              <Edit className="w-5 h-5 text-kastom-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeneficiaryDetailPage;