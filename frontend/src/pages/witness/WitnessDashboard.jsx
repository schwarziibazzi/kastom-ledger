import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
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
  Bell
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
              <Shield className="w-4 h-4 text-kastom-green" />
              <span className="text-kastom-muted font-medium">
                {user?.sevispassUid} • {user?.province}
              </span>
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Witness
              </span>
            </div>
            <p className="text-sm text-kastom-muted mt-2">
              You have {stats.pending} pending witness request(s).
            </p>
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
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
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

        <div className="card card-hover">
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-kastom-dark">Pending Witness Requests</h2>
            <Link to="/witness-requests" className="text-sm text-kastom-green hover:underline font-medium">
              View all
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No pending requests</p>
              <p className="text-sm text-kastom-muted/60 mt-1">You're all caught up</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <div>
                    <p className="font-semibold text-kastom-dark">
                      {request.legacyProfile?.title || 'Estate'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-kastom-muted">
                      <span>From: {request.successor?.owner?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>Action: {request.actionVerified?.replace(/_/g, ' ') || 'Nomination'}</span>
                    </div>
                    <p className="text-xs text-kastom-muted/60 mt-1">
                      {formatDate(request.timestamp)}
                    </p>
                  </div>
                  <Link 
                    to={`/witness-requests/${request.id}`}
                    className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-kastom-green" />
            Notifications
          </h2>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-3 rounded-xl border ${notif.read ? 'border-kastom-border/50' : 'border-kastom-green/30 bg-kastom-green-bg'}`}>
                  <p className="font-medium text-kastom-dark text-sm">{notif.title}</p>
                  <p className="text-xs text-kastom-muted mt-1">{notif.message}</p>
                  <p className="text-xs text-kastom-muted/60 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default WitnessDashboard;