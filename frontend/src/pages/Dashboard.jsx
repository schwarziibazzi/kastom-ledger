import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Users, 
  UserCheck, 
  Clock, 
  ArrowRight, 
  Plus, 
  Upload, 
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    items: 0,
    successors: 0,
    pendingWitness: 0,
    ledgerEntries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const itemsRes = await api.get('/legacy/items');
      const items = itemsRes.data.items || [];

      const successorsRes = await api.get('/successors');
      const successors = successorsRes.data.successors || [];

      const ledgerRes = await api.get('/ledger');
      const ledger = ledgerRes.data.ledger?.entries || [];

      const witnessRes = await api.get('/successors/pending');
      const pending = witnessRes.data.requests || [];

      setStats({
        items: items.length,
        successors: successors.length,
        pendingWitness: pending.length,
        ledgerEntries: ledger.length
      });

      setRecentActivity(ledger.slice(-5).reverse());
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'LEGACY_PROFILE_CREATED': FileText,
      'LEGACY_ITEM_ADDED': FileText,
      'SUCCESSOR_NOMINATED': Users,
      'WITNESS_APPROVED': UserCheck,
      'SUCCESSION_ACCESS_GRANTED': Shield
    };
    const Icon = icons[actionType] || Clock;
    return Icon;
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
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-green-50 text-kastom-success px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/legacy" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Create Legacy
            </Link>
            <Link to="/documents" className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Upload Document
            </Link>
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
              <p className="text-sm text-kastom-muted font-medium">Legacy Items</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.items}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <FileText className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Successors</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.successors}</p>
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
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.pendingWitness}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Ledger Entries</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.ledgerEntries}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <Clock className="w-6 h-6 text-kastom-green" />
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
        <Link to="/legacy" className="card card-hover border-2 border-dashed border-kastom-green/20 hover:border-kastom-green transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Create Legacy</h3>
              <p className="text-sm text-kastom-muted">Preserve your story</p>
            </div>
            <ArrowRight className="w-5 h-5 text-kastom-green" />
          </div>
        </Link>

        <Link to="/documents" className="card card-hover border-2 border-dashed border-kastom-border hover:border-kastom-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Upload Document</h3>
              <p className="text-sm text-kastom-muted">Add files & records</p>
            </div>
            <Upload className="w-5 h-5 text-kastom-muted" />
          </div>
        </Link>

        <Link to="/successors" className="card card-hover border-2 border-dashed border-kastom-border hover:border-kastom-green/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Add Successor</h3>
              <p className="text-sm text-kastom-muted">Nominate a trustee</p>
            </div>
            <Users className="w-5 h-5 text-kastom-muted" />
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
            <p className="text-sm text-kastom-muted/60 mt-1">Start building your legacy today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((entry) => {
              const Icon = getActionIcon(entry.actionType);
              return (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-kastom-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-kastom-green" />
                    </div>
                    <div>
                      <p className="font-medium text-kastom-dark">
                        {entry.actionType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-kastom-muted">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;