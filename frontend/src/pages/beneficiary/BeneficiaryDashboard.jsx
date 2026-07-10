import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Home, 
  Users, 
  Clock, 
  Shield,
  CheckCircle,
  FileText,
  FolderOpen,
  MessageSquare,
  Eye,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryDashboard() {
  const { user } = useAuth();
  const { isBeneficiary } = useRole();
  const [loading, setLoading] = useState(true);
  const [estates, setEstates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isBeneficiary) {
      return;
    }
    fetchDashboardData();
  }, [isBeneficiary]);

  const fetchDashboardData = async () => {
    try {
      const estatesRes = await api.get('/beneficiary/estates');
      setEstates(estatesRes.data.estates || []);

      const docsRes = await api.get('/beneficiary/documents');
      setDocuments(docsRes.data.documents || []);

      const messagesRes = await api.get('/beneficiary/messages');
      setMessages(messagesRes.data.messages || []);

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
              <span className="inline-flex items-center gap-1 ml-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                Beneficiary
              </span>
            </div>
            <p className="text-sm text-kastom-muted mt-2">
              You have been nominated as a beneficiary in {estates.length} estate(s).
            </p>
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
              <p className="text-sm text-kastom-muted font-medium">Estates</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{estates.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Documents</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{documents.length}</p>
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
              <p className="text-3xl font-bold text-kastom-dark mt-1">{messages.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-kastom-green-bg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-kastom-green" />
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kastom-muted font-medium">Notifications</p>
              <p className="text-3xl font-bold text-kastom-dark mt-1">{notifications.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estates List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-kastom-dark">My Estates</h2>
          <span className="badge badge-muted">{estates.length} estates</span>
        </div>

        {estates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No estates assigned</p>
            <p className="text-sm text-kastom-muted/60 mt-1">You haven't been added as a beneficiary yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {estates.map((estate) => (
              <div key={estate.id} className="flex items-center justify-between p-4 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <div>
                  <p className="font-semibold text-kastom-dark">{estate.title}</p>
                  <div className="flex items-center gap-3 text-sm text-kastom-muted">
                    <span>Owner: {estate.owner?.name}</span>
                    <span>•</span>
                    <span>Status: {estate.status?.replace(/_/g, ' ') || 'Active'}</span>
                    <span>•</span>
                    <span className="text-xs text-kastom-green">View Only</span>
                  </div>
                </div>
                <Link 
                  to={`/beneficiary/estate/${estate.id}`}
                  className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
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
      {documents.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mt-6"
        >
          <h2 className="text-lg font-semibold text-kastom-dark mb-4">Available Documents</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {documents.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-kastom-cream rounded-xl border border-kastom-border/50">
                <FileText className="w-5 h-5 text-kastom-green" />
                <div className="flex-1">
                  <p className="font-medium text-kastom-dark text-sm">{doc.title}</p>
                  <p className="text-xs text-kastom-muted">{doc.estate?.title}</p>
                </div>
                <button className="text-kastom-green hover:underline text-sm">View</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default BeneficiaryDashboard;