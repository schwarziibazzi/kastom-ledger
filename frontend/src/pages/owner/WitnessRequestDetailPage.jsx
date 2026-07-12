import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Shield, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

function WitnessRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/witness/requests/${id}`);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Fetch request error:', error);
      toast.error('Failed to load witness request');
      navigate('/witness-requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <p className="text-kastom-muted font-medium">Request not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/witness-requests')}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Witness Requests
      </button>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
                <Shield className="w-6 h-6 text-kastom-green" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-kastom-dark">Witness Request</h1>
                <p className="text-sm text-kastom-muted">
                  {request.legacyProfile?.title || 'Estate'}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-sm text-kastom-muted">
                <User className="w-4 h-4" />
                Owner: {request.successor?.owner?.name || 'Unknown'}
              </p>
              <p className="flex items-center gap-2 text-sm text-kastom-muted">
                <FileText className="w-4 h-4" />
                Action: {request.actionVerified?.replace(/_/g, ' ') || 'Nomination'}
              </p>
              <p className="flex items-center gap-2 text-sm text-kastom-muted">
                <Calendar className="w-4 h-4" />
                Submitted: {formatDate(request.timestamp)}
              </p>
              <div className="flex items-center gap-2">
                {request.digitalSignature ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-kastom-success" />
                    <span className="text-sm font-medium text-kastom-success">Approved</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Pending Approval</span>
                  </>
                )}
              </div>
              {request.digitalSignature && (
                <p className="text-xs text-kastom-muted/60 font-mono">
                  Signature: {request.digitalSignature}
                </p>
              )}
              {request.comments && (
                <div className="mt-4 p-3 bg-kastom-cream rounded-xl">
                  <p className="text-sm text-kastom-muted">Comments</p>
                  <p className="font-medium text-kastom-dark mt-1">{request.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WitnessRequestDetailPage;