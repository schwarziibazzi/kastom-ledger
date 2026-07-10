import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [auditEntries, setAuditEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    suspicious: 0,
    needsReview: 0
  });

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      const response = await api.get('/admin/audit');
      setAuditEntries(response.data.auditEntries || []);
      setStats(response.data.stats || { total: 0, verified: 0, suspicious: 0, needsReview: 0 });
    } catch (error) {
      console.error('Fetch audit data error:', error);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'verified': 'badge-success',
      'suspicious': 'badge-warning',
      'needs_review': 'badge-pending'
    };
    return badges[status] || 'badge-muted';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'verified': CheckCircle,
      'suspicious': AlertTriangle,
      'needs_review': Clock
    };
    const Icon = icons[status] || Clock;
    return Icon;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = entry.entityType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.entityId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Audit</h1>
        <p className="text-kastom-muted mt-1">Verify and review system integrity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-2xl font-bold text-kastom-dark">{stats.total}</p>
          <p className="text-sm text-kastom-muted">Total Entries</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-kastom-success">{stats.verified}</p>
          <p className="text-sm text-kastom-muted">Verified</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-yellow-600">{stats.suspicious}</p>
          <p className="text-sm text-kastom-muted">Suspicious</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-orange-600">{stats.needsReview}</p>
          <p className="text-sm text-kastom-muted">Needs Review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit entries..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="suspicious">Suspicious</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {/* Audit List */}
      <div className="card">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-kastom-muted mx-auto mb-4" />
            <p className="text-kastom-muted font-medium">No audit entries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const Icon = getStatusIcon(entry.status);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors
                    ${entry.status === 'verified' ? 'bg-green-50 border-green-200' : 
                      entry.status === 'suspicious' ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-orange-50 border-orange-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${entry.status === 'verified' ? 'bg-green-100' : 
                        entry.status === 'suspicious' ? 'bg-yellow-100' : 
                        'bg-orange-100'}`}>
                      <Icon className={`w-5 h-5
                        ${entry.status === 'verified' ? 'text-kastom-success' : 
                          entry.status === 'suspicious' ? 'text-yellow-600' : 
                          'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-kastom-dark">{entry.entityType}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-kastom-muted">
                        <span>ID: {entry.entityId}</span>
                        <span>•</span>
                        <span>Hash: {entry.hash?.slice(0, 16)}...</span>
                        <span>•</span>
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(entry.status)}`}>
                    {entry.status.replace(/_/g, ' ')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditPage;