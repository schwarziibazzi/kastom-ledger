import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Calendar,
  User,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

function WitnessApproved() {
  const { user } = useAuth();
  const { isWitness } = useRole();
  const [loading, setLoading] = useState(true);
  const [approvedRequests, setApprovedRequests] = useState([]);

  useEffect(() => {
    if (!isWitness) {
      return;
    }
    fetchApproved();
  }, [isWitness]);

  const fetchApproved = async () => {
    try {
      const response = await api.get('/witness/approved');
      setApprovedRequests(response.data.requests || []);
    } catch (error) {
      console.error('Fetch approved error:', error);
      toast.error('Failed to load approved requests');
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/witness-dashboard" className="p-2 rounded-lg hover:bg-kastom-cream transition-colors">
          <ArrowLeft className="w-5 h-5 text-kastom-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Approved Requests</h1>
          <p className="text-kastom-muted mt-1">All witness requests you've approved</p>
        </div>
      </div>

      {approvedRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No approved requests</p>
          <p className="text-sm text-kastom-muted/60 mt-1">You haven't approved any requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvedRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-kastom-success" />
                </div>
                <div>
                  <p className="font-semibold text-kastom-dark">
                    {request.legacyProfile?.title || 'Estate'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-kastom-muted">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {request.successor?.owner?.name || 'Unknown'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(request.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                to={`/witness-requests/${request.id}`}
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                <Eye className="w-4 h-4 text-kastom-muted" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WitnessApproved;