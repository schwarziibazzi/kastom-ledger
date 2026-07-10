import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Shield,
  Users,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

function WitnessRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/witness/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Fetch witness requests error:', error);
      toast.error('Failed to load witness requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'witness_pending': 'badge-pending',
      'verified': 'badge-success',
      'approved': 'badge-success',
      'rejected': 'badge-warning'
    };
    return badges[status] || 'badge-muted';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'short',
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Witness Requests</h1>
        <p className="text-kastom-muted mt-1">Track and manage your witness verification requests</p>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No witness requests</p>
            <p className="text-sm text-kastom-muted/60 mt-1">You haven't requested any witness verifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-kastom-green/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-kastom-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-kastom-dark">
                      {request.legacyProfile?.title || 'Estate'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-kastom-muted">
                      <span>Witness: {request.witness?.name || request.witnessUid}</span>
                      <span>•</span>
                      <span>Action: {request.actionVerified?.replace(/_/g, ' ') || 'Nomination'}</span>
                    </div>
                    <p className="text-xs text-kastom-muted/60 mt-1">
                      {formatDate(request.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusBadge(request.status || request.digitalSignature ? 'verified' : 'pending')}`}>
                    {request.digitalSignature ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </span>
                  <Link 
                    to={`/witness-requests/${request.id}`}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4 text-kastom-muted" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WitnessRequestsPage;