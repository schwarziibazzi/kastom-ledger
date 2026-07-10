import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCheck, 
  Clock, 
  ArrowRight, 
  Plus, 
  Upload, 
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Bell,
  Home,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

function OwnerDashboard() {
  const { user } = useAuth();
  const { isOwner } = useRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estates, setEstates] = useState([]);
  const [stats, setStats] = useState({
    totalEstates: 0,
    totalAssets: 0,
    totalBeneficiaries: 0,
    pendingWitnesses: 0,
    completionPercentage: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isOwner) {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [isOwner]);

  const fetchDashboardData = async () => {
    try {
      // Fetch estates
      const estatesRes = await api.get('/estates');
      const estatesData = estatesRes.data.estates || [];
      setEstates(estatesData);

      // Calculate stats
      let totalAssets = 0;
      let totalBeneficiaries = 0;
      let pendingWitnesses = 0;
      let completionTotal = 0;

      estatesData.forEach(estate => {
        totalAssets += estate.assets?.length || 0;
        totalBeneficiaries += estate.beneficiaries?.length || 0;
        pendingWitnesses += estate.witnesses?.filter(w => w.status === 'pending')?.length || 0;
        completionTotal += estate.completionPercentage || 0;
      });

      setStats({
        totalEstates: estatesData.length,
        totalAssets,
        totalBeneficiaries,
        pendingWitnesses,
        completionPercentage: estatesData.length > 0 ? Math.round(completionTotal / estatesData.length) : 0
      });

      // Get recent activity
      const ledgerRes = await api.get('/ledger');
      setRecentActivity(ledgerRes.data.ledger?.entries?.slice(-5).reverse() || []);

      // Get notifications
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
              Welcome back, {user?.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-kastom-green" />
              <span className="text-kastom-muted font-medium">
                {user?.sevispassUid} • {user?.province}
              </span>
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-green-50 text-kastom-success px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Inheritance Owner
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/estate/create" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Create Estate
            </Link>
            <Link to="/assets/create" className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Add Asset
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Estates</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalEstates}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <Home className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Assets</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalAssets}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <Package className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Beneficiaries</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalBeneficiaries}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <Users className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Pending Witness</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.pendingWitnesses}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Estate Completion</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.completionPercentage}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-kastom-success" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <Link to="/assets/create" className="card card-hover border-2 border-dashed border-kastom-green/20 hover:border-kastom-green transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Create New Asset</h3>
              <p className="text-sm text-kastom-muted">Add property or item</p>
            </div>
            <ArrowRight className="w-5 h-5 text-kastom-green" />
          </div>
        </Link>

        <Link to="/beneficiaries/add" className="card card-hover border-2 border-dashed border-kastom-border hover:border-kastom-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Add Beneficiary</h3>
              <p className="text-sm text-kastom-muted">Nominate an heir</p>
            </div>
            <Users className="w-5 h-5 text-kastom-muted" />
          </div>
        </Link>

        <Link to="/will" className="card card-hover border-2 border-dashed border-kastom-border hover:border-kastom-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Digital Will</h3>
              <p className="text-sm text-kastom-muted">Create your will</p>
            </div>
            <FileText className="w-5 h-5 text-kastom-muted" />
          </div>
        </Link>

        <Link to="/ledger" className="card card-hover border-2 border-dashed border-kastom-border hover:border-kastom-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">View Timeline</h3>
              <p className="text-sm text-kastom-muted">Ledger history</p>
            </div>
            <Calendar className="w-5 h-5 text-kastom-muted" />
          </div>
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-kastom-dark">Recent Activity</h2>
            <Link to="/ledger" className="text-sm text-kastom-green hover:underline font-medium inline-flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No activity yet</p>
              <p className="text-sm text-kastom-muted/60 mt-1">Start building your estate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-3 border-b border-kastom-border/50 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-kastom-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-kastom-dark text-sm">
                      {entry.actionType?.replace(/_/g, ' ') || 'Activity'}
                    </p>
                    <p className="text-xs text-kastom-muted">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                  <span className="badge badge-success text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-kastom-dark flex items-center gap-2">
              <Bell className="w-5 h-5 text-kastom-green" />
              Notifications
            </h2>
            <button className="text-sm text-kastom-green hover:underline font-medium">
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No notifications</p>
              <p className="text-sm text-kastom-muted/60 mt-1">You're all caught up</p>
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

export default OwnerDashboard;