import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

function WitnessRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/witness/requests/${id}`);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Fetch request error:', error);
      toast.error('Failed to load request');
      navigate('/witness-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await api.post(`/witness/requests/${id}/approve`, { comments });
      toast.success('Request approved successfully');
      navigate('/witness-dashboard');
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await api.post(`/witness/requests/${id}/reject`, { comments });
      toast.success('Request rejected');
      navigate('/witness-dashboard');
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
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

  const isAlreadyProcessed = request.digitalSignature || request.status === 'rejected';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/witness-dashboard')}
        className="inline-flex items-center gap-2 text-kastom-muted hover:text-kastom-dark mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-kastom-dark">Witness Request</h1>
            <p className="text-kastom-muted mt-1">
              {request.legacyProfile?.title || 'Estate'}
            </p>
          </div>
          <div className={`badge ${isAlreadyProcessed ? 'badge-success' : 'badge-pending'} text-sm px-4 py-2`}>
            {isAlreadyProcessed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                {request.digitalSignature ? 'Approved' : 'Rejected'}
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-1" />
                Pending Review
              </>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl">
            <User className="w-5 h-5 text-kastom-green" />
            <div>
              <p className="text-sm text-kastom-muted">Requester</p>
              <p className="font-medium text-kastom-dark">{request.successor?.owner?.name || 'Unknown'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl">
            <Shield className="w-5 h-5 text-kastom-green" />
            <div>
              <p className="text-sm text-kastom-muted">Action Required</p>
              <p className="font-medium text-kastom-dark">
                {request.actionVerified?.replace(/_/g, ' ') || 'Successor Nomination'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl">
            <Calendar className="w-5 h-5 text-kastom-green" />
            <div>
              <p className="text-sm text-kastom-muted">Submitted</p>
              <p className="font-medium text-kastom-dark">{formatDate(request.timestamp)}</p>
            </div>
          </div>

          {request.digitalSignature && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-5 h-5 text-kastom-success" />
              <div>
                <p className="text-sm text-kastom-muted">Digital Signature</p>
                <p className="font-mono text-xs text-kastom-dark">{request.digitalSignature}</p>
              </div>
            </div>
          )}

          {request.comments && (
            <div className="p-3 bg-kastom-cream rounded-xl">
              <p className="text-sm text-kastom-muted">Comments</p>
              <p className="font-medium text-kastom-dark mt-1">{request.comments}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isAlreadyProcessed && (
          <div className="mt-6 pt-6 border-t border-kastom-border/50">
            <div className="mb-4">
              <label className="input-label">Comments (Optional)</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Add any comments..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2 text-kastom-danger border-kastom-danger/30 hover:bg-red-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
            </div>
          </div>
        )}

        {isAlreadyProcessed && (
          <div className="mt-6 pt-6 border-t border-kastom-border/50">
            <div className="flex items-center gap-2 p-3 bg-kastom-cream rounded-xl text-kastom-muted">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">This request has already been processed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WitnessRequestDetail;