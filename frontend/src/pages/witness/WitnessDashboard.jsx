import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Shield,
  FileText,
  Users,
  Bell,
  AlertCircle,
  Eye,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function WitnessDashboard() {
  const { user } = useAuth();
  const { isWitness } = useRole();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!isWitness) {
      return;
    }
    fetchDashboardData();
  }, [isWitness]);

  const fetchDashboardData = async () => {
    try {
      const requestsRes = await api.get('/witness/requests');
      const requests = requestsRes.data.requests || [];

      const pending = requests.filter(r => r.status === 'pending' || !r.digitalSignature);
      const approved = requests.filter(r => r.digitalSignature);
      const rejected = requests.filter(r => r.status === 'rejected');

      setPendingRequests(pending);
      setApprovedRequests(approved);
      setRejectedRequests(rejected);

      setStats({
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length
      });

      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data.notifications?.slice(0, 5) || []);
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/witness/${id}/approve`);
      toast.success('Request approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/witness/${id}/reject`);
      toast.success('Request rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject request');
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
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-kastom-dark tracking-tight">
              Welcome, {user?.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-kastom-muted font-medium">
                {user?.sevispassUid} • {user?.province}
              </span>
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                <UserCheck className="w-3 h-3" />
                Witness
              </span>
            </div>
            <p className="text-sm text-kastom-muted mt-2">
              You have {stats.pending} pending witness request(s) to review.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm border border-purple-200">
              Verification Role Only
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="card card-hover border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Approved</p>
              <p className="text-3xl font-bold text-kastom-success mt-1">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-kastom-success" />
            </div>
          </div>
        </div>

        <div className="card card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Rejected</p>
              <p className="text-3xl font-bold text-kastom-danger mt-1">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-kastom-danger" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Witness Only */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-4 mb-8"
      >
        <Link to="/witness-requests" className="card card-hover border-2 border-dashed border-yellow-300 hover:border-yellow-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Review Pending Requests</h3>
              <p className="text-sm text-kastom-muted">Verify and approve requests</p>
            </div>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
        </Link>

        <Link to="/witness-approved" className="card card-hover border-2 border-dashed border-green-300 hover:border-green-500 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Approved Requests</h3>
              <p className="text-sm text-kastom-muted">View your approval history</p>
            </div>
            <CheckCircle className="w-5 h-5 text-kastom-success" />
          </div>
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-kastom-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Requests
            </h2>
            <span className="badge badge-pending">{stats.pending} pending</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-kastom-success" />
              </div>
              <p className="text-kastom-muted font-medium">No pending requests</p>
              <p className="text-sm text-kastom-muted/60 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-kastom-dark text-sm">
                        {request.legacyProfile?.title || 'Estate'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-kastom-muted">
                        <span>From: {request.successor?.owner?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(request.timestamp)}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/witness-requests/${request.id}`}
                      className="btn-primary text-sm px-3 py-1.5 inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity / Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-kastom-green" />
            Recent Activity
          </h2>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="flex items-center gap-3 p-2.5 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <div className="w-8 h-8 rounded-lg bg-kastom-green-bg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-kastom-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-kastom-dark text-sm">{notif.title}</p>
                    <p className="text-xs text-kastom-muted">{notif.message}</p>
                  </div>
                  <span className="text-xs text-kastom-muted/60">{formatDate(notif.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Approved Requests Summary */}
      {approvedRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kastom-dark flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-kastom-success" />
              Recently Approved
            </h2>
            <Link to="/witness-approved" className="text-sm text-purple-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {approvedRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-200">
                <div>
                  <p className="font-medium text-kastom-dark text-sm">
                    {request.legacyProfile?.title || 'Estate'}
                  </p>
                  <p className="text-xs text-kastom-muted">Verified on {formatDate(request.timestamp)}</p>
                </div>
                <span className="badge badge-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approved
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default WitnessDashboard;