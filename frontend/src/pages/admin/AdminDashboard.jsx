import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleProvider';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Activity, 
  FileBarChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  FileText,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEstates: 0,
    pendingVerifications: 0,
    totalLedgerEntries: 0,
    activeUsers: 0,
    totalDocuments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats || {});

      const activityRes = await api.get('/admin/activity');
      setRecentActivity(activityRes.data.activity || []);

      const reviewsRes = await api.get('/admin/pending-reviews');
      setPendingReviews(reviewsRes.data.reviews || []);
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
              Administrator Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-kastom-muted font-medium">
                {user?.sevispassUid} • {user?.province}
              </span>
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                System Administrator
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" />
              Search Users
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Users</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Estates</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalEstates}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <FileText className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingVerifications}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Ledger Entries</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalLedgerEntries}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-kastom-muted text-center py-8">No activity logged</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-kastom-border/50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-kastom-cream flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-kastom-muted" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-kastom-dark">{activity.action}</p>
                    <p className="text-xs text-kastom-muted">
                      {activity.user?.name} • {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4">Pending Reviews</h2>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-kastom-cream flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-kastom-success" />
              </div>
              <p className="text-kastom-muted">No pending reviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <div>
                    <p className="font-medium text-kastom-dark text-sm">{review.title}</p>
                    <p className="text-xs text-kastom-muted">From: {review.user?.name}</p>
                  </div>
                  <button className="btn-primary text-sm px-3 py-1">
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;