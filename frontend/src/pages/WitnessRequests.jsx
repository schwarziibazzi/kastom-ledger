import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

function WitnessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

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

  const handleApprove = async (witnessId) => {
    setProcessing(witnessId);
    try {
      await api.post(`/witness/${witnessId}/approve`);
      toast.success('Witness approved successfully');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: 'badge-pending', icon: Clock, label: 'Pending' },
      'verified': { color: 'badge-success', icon: CheckCircle, label: 'Verified' },
      'rejected': { color: 'badge-warning', icon: XCircle, label: 'Rejected' }
    };
    const badge = badges[status] || { color: 'badge-muted', icon: Clock, label: status };
    return badge;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Witness Requests</h1>
        <p className="text-kastom-muted mt-1">Review and confirm witness requests</p>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No witness requests</p>
            <p className="text-sm text-kastom-muted/60 mt-1">You have no pending witness requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const badge = getStatusBadge(request.status || 'pending');
              const Icon = badge.icon;
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-kastom-cream rounded-xl border border-kastom-border/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-kastom-green/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-kastom-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-kastom-dark">
                          {request.legacyProfile?.title || 'Legacy Record'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-kastom-muted mt-1">
                          <span>From: {request.successor?.owner?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>Action: {request.actionVerified?.replace(/_/g, ' ') || 'Nomination'}</span>
                        </div>
                        {request.digitalSignature && (
                          <p className="text-xs text-kastom-green font-mono mt-1">
                            Signature: {request.digitalSignature.substring(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${badge.color}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {badge.label}
                      </span>
                      {!request.digitalSignature && (
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
                        >
                          {processing === request.id ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WitnessRequests;