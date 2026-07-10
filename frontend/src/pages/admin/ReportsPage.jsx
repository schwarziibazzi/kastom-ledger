import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FileBarChart, 
  Download, 
  Calendar,
  Users,
  FileText,
  Package,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    userGrowth: [],
    estateStats: [],
    activityStats: []
  });
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`/admin/reports?range=${dateRange}`);
      setReports(response.data.reports || { userGrowth: [], estateStats: [], activityStats: [] });
    } catch (error) {
      console.error('Fetch reports error:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'short',
      day: 'numeric'
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Reports</h1>
          <p className="text-kastom-muted mt-1">System analytics and reporting</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
          <button className="btn-secondary inline-flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Users</p>
              <p className="text-2xl font-bold text-kastom-dark">1,284</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-kastom-success mt-2">↑ 12% this month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Estates</p>
              <p className="text-2xl font-bold text-kastom-dark">342</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <FileText className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
          <p className="text-xs text-kastom-success mt-2">↑ 8% this month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Total Assets</p>
              <p className="text-2xl font-bold text-kastom-dark">1,876</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-kastom-success mt-2">↑ 15% this month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-kastom-dark">67%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-kastom-success" />
            </div>
          </div>
          <p className="text-xs text-kastom-success mt-2">↑ 3% this month</p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-kastom-dark">User Growth</h2>
          <BarChart3 className="w-5 h-5 text-kastom-muted" />
        </div>
        <div className="h-48 flex items-end gap-2">
          {reports.userGrowth?.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-kastom-green/60 rounded-t transition-all hover:bg-kastom-green"
                style={{ height: `${(point.value / Math.max(...reports.userGrowth.map(p => p.value))) * 100}%` }}
              />
              <span className="text-xs text-kastom-muted">{formatDate(point.date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estate Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kastom-dark">Estate Distribution</h2>
            <PieChart className="w-5 h-5 text-kastom-muted" />
          </div>
          <div className="space-y-3">
            {reports.estateStats?.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-kastom-muted">{stat.label}</span>
                  <span className="font-medium text-kastom-dark">{stat.value}</span>
                </div>
                <div className="w-full h-2 bg-kastom-cream rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-kastom-green rounded-full transition-all"
                    style={{ width: `${(stat.value / reports.estateStats.reduce((sum, s) => sum + s.value, 0)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kastom-dark">Activity Overview</h2>
            <Activity className="w-5 h-5 text-kastom-muted" />
          </div>
          <div className="space-y-3">
            {reports.activityStats?.map((stat, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-kastom-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color || 'bg-kastom-green'}`} />
                  <span className="text-sm text-kastom-muted">{stat.label}</span>
                </div>
                <span className="font-medium text-kastom-dark">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-kastom-dark">Export Reports</h3>
            <p className="text-sm text-kastom-muted">Download reports in various formats</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary text-sm inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button className="btn-secondary text-sm inline-flex items-center gap-2">
              <FileBarChart className="w-4 h-4" />
              CSV
            </button>
            <button className="btn-secondary text-sm inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;