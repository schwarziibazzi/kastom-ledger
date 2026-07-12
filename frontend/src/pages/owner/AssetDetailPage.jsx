import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  User,
  FileText
} from 'lucide-react';

function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await api.get(`/assets/${id}`);
      setAsset(response.data.asset);
    } catch (error) {
      console.error('Fetch asset error:', error);
      toast.error('Failed to load asset');
      navigate('/assets');
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

  if (!asset) {
    return (
      <div className="text-center py-16">
        <p className="text-kastom-muted font-medium">Asset not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/assets')}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assets
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
                <Package className="w-6 h-6 text-kastom-green" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-kastom-dark">{asset.title}</h1>
                <p className="text-sm text-kastom-muted">{asset.type}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {asset.description && (
                <p className="text-kastom-muted">{asset.description}</p>
              )}
              {asset.location && (
                <p className="flex items-center gap-2 text-sm text-kastom-muted">
                  <MapPin className="w-4 h-4" />
                  {asset.location}
                </p>
              )}
              {asset.estimatedValue && (
                <p className="flex items-center gap-2 text-sm font-medium text-kastom-green">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(asset.estimatedValue)}
                </p>
              )}
              {asset.estate && (
                <p className="flex items-center gap-2 text-sm text-kastom-muted">
                  <FileText className="w-4 h-4" />
                  Estate: <Link to={`/estate/${asset.estate.id}`} className="text-kastom-green hover:underline">{asset.estate.title}</Link>
                </p>
              )}
              {asset.beneficiary && (
                <p className="flex items-center gap-2 text-sm text-kastom-muted">
                  <User className="w-4 h-4" />
                  Beneficiary: {asset.beneficiary.user?.name || 'Not assigned'}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm text-kastom-muted">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(asset.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/assets/edit/${asset.id}`)}
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

export default AssetDetailPage;