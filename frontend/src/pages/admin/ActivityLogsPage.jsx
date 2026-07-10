import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Activity, 
  Search, 
  Filter,
  Clock,
  User,
  FileText,
  Users,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function ActivityLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/admin/activity?page=${page}&limit=20`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Fetch logs error:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('USER')) return User;
    if (action.includes('ESTATE')) return FileText;
    if (action.includes('BENEFICIARY')) return Users;
    if (action.includes('WITNESS')) return Shield;
    return Activity;
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'text-kastom-green';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-600';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-red-500';
    if (action.includes('LOGIN')) return 'text-purple-600';
    return 'text-kastom-muted';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action?.includes(filterAction);
    return matchesSearch && matchesAction;
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
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Activity Logs</h1>
        <p className="text-kastom-muted mt-1">View all system activity</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action or user..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="VERIFY">Verify</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="card">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-kastom-muted mx-auto mb-4" />
            <p className="text-kastom-muted font-medium">No activity logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              const color = getActionColor(log.action);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-kastom-dark">{log.action}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-kastom-muted">
                        <span>User: {log.user?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-kastom-muted/60 mt-1">
                          {JSON.stringify(log.details).slice(0, 100)}
                        </p>
                      )}
                    </div>
                  </div>
                  {log.ipAddress && (
                    <span className="text-xs text-kastom-muted/60 font-mono">{log.ipAddress}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-kastom-border/50">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-kastom-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogsPage;