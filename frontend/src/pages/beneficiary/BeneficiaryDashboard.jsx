import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Gift, 
  Home, 
  Users, 
  Clock, 
  Shield,
  CheckCircle,
  FileText,
  FolderOpen,
  MessageSquare,
  Eye,
  Bell,
  Package,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryDashboard() {
  const { user } = useAuth();
  const { isBeneficiary } = useRole();
  const [loading, setLoading] = useState(true);
  const [estates, setEstates] = useState([]);
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalEstates: 0,
    totalAssets: 0,
    totalDocuments: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    if (!isBeneficiary) {
      return;
    }
    fetchDashboardData();
  }, [isBeneficiary]);

  const fetchDashboardData = async () => {
    try {
      const estatesRes = await api.get('/beneficiary/estates');
      const estatesData = estatesRes.data.estates || [];
      setEstates(estatesData);

      // Get all assets from these estates
      let allAssets = [];
      estatesData.forEach(estate => {
        if (estate.assets) {
          allAssets = [...allAssets, ...estate.assets];
        }
      });
      setAssets(allAssets);

      const docsRes = await api.get('/beneficiary/documents');
      setDocuments(docsRes.data.documents || []);

      const messagesRes = await api.get('/beneficiary/messages');
      setMessages(messagesRes.data.messages || []);

      const notifRes = await api.get('/notifications');
      setNotifications(notifRes.data.notifications?.slice(0, 5) || []);

      setStats({
        totalEstates: estatesData.length,
        totalAssets: allAssets.length,
        totalDocuments: docsRes.data.documents?.length || 0,
        unreadMessages: messagesRes.data.messages?.filter(m => !m.read)?.length || 0
      });
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
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                <Gift className="w-3 h-3" />
                Beneficiary / Heir
              </span>
            </div>
            <p className="text-sm text-kastom-muted mt-2">
              You have been nominated as a beneficiary in {stats.totalEstates} estate(s).
            </p>
          </div>
          <div className="flex gap-3">
            <span className="bg-kastom-cream text-kastom-muted px-4 py-2 rounded-xl text-sm border border-kastom-border/50">
              View-Only Access
            </span>
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
              <p className="text-sm text-kastom-muted font-medium">Inherited Estates</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalEstates}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Inherited Assets</p>
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
              <p className="text-sm text-kastom-muted font-medium">Documents</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.totalDocuments}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Messages</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{stats.unreadMessages}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Beneficiary Only */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        <Link to="/my-estates" className="card card-hover border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">View Inherited Estates</h3>
              <p className="text-sm text-kastom-muted">See all estates you're part of</p>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </div>
        </Link>

        <Link to="/inherited-assets" className="card card-hover border-2 border-dashed border-kastom-green/20 hover:border-kastom-green/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">View Assets</h3>
              <p className="text-sm text-kastom-muted">See assets allocated to you</p>
            </div>
            <Package className="w-5 h-5 text-kastom-green" />
          </div>
        </Link>

        <Link to="/messages" className="card card-hover border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-kastom-dark">Messages</h3>
              <p className="text-sm text-kastom-muted">Communicate with estate owners</p>
            </div>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Estates */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-kastom-dark">My Inherited Estates</h2>
            <Link to="/my-estates" className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {estates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No estates assigned</p>
              <p className="text-sm text-kastom-muted/60 mt-1">You haven't been added as a beneficiary yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {estates.slice(0, 3).map((estate) => (
                <div key={estate.id} className="flex items-center justify-between p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                  <div>
                    <p className="font-semibold text-kastom-dark">{estate.title}</p>
                    <div className="flex items-center gap-2 text-sm text-kastom-muted">
                      <span>Owner: {estate.owner?.name}</span>
                      <span>•</span>
                      <span className="text-xs text-blue-600">View Only</span>
                    </div>
                  </div>
                  <Link 
                    to={`/beneficiary/estate/${estate.id}`}
                    className="btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Available Documents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-kastom-green" />
            Available Documents
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-kastom-muted" />
              </div>
              <p className="text-kastom-muted font-medium">No documents available</p>
              <p className="text-sm text-kastom-muted/60 mt-1">Documents will appear here when shared</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-kastom-cream rounded-xl border border-kastom-border/50 hover:border-blue-300 transition-colors">
                  <FileText className="w-5 h-5 text-kastom-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-kastom-dark text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-kastom-muted truncate">{doc.estate?.title}</p>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm font-medium">View</button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mt-6"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-kastom-green" />
            Recent Notifications
          </h2>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notif) => (
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
        </motion.div>
      )}
    </div>
  );
}

export default BeneficiaryDashboard;