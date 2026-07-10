import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  FileText, 
  Users,
  Package,
  Shield,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

function NotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'WITNESS_APPROVED': CheckCircle,
      'BENEFICIARY_ACCEPTED': Users,
      'WITNESS_REQUESTED': UserCheck,
      'DOCUMENT_UPLOADED': FileText,
      'ESTATE_UPDATED': Package,
      'VERIFICATION_COMPLETE': Shield,
      'ADMIN_VERIFIED': Shield,
      'DEATH_VERIFIED': Shield,
      'EXECUTOR_ACTIVATED': Users,
      'BENEFICIARY_NOTIFIED': Bell
    };
    const Icon = icons[type] || Bell;
    return Icon;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'WITNESS_APPROVED': 'text-green-600 bg-green-50',
      'BENEFICIARY_ACCEPTED': 'text-blue-600 bg-blue-50',
      'WITNESS_REQUESTED': 'text-yellow-600 bg-yellow-50',
      'DOCUMENT_UPLOADED': 'text-purple-600 bg-purple-50',
      'ESTATE_UPDATED': 'text-kastom-green bg-kastom-green-bg',
      'VERIFICATION_COMPLETE': 'text-kastom-success bg-green-50',
      'ADMIN_VERIFIED': 'text-red-600 bg-red-50'
    };
    return colors[type] || 'text-kastom-muted bg-kastom-cream';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Notifications</h1>
          <p className="text-kastom-muted mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary text-sm inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
            ${filter === 'all' ? 'bg-kastom-green text-white' : 'bg-white text-kastom-muted hover:bg-kastom-cream'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
            ${filter === 'unread' ? 'bg-kastom-green text-white' : 'bg-white text-kastom-muted hover:bg-kastom-cream'}`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
            ${filter === 'read' ? 'bg-kastom-green text-white' : 'bg-white text-kastom-muted hover:bg-kastom-cream'}`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No notifications</p>
            <p className="text-sm text-kastom-muted/60 mt-1">
              {filter === 'all' ? 'You\'re all caught up' : 'No notifications in this filter'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border transition-all duration-200
                  ${notification.read 
                    ? 'bg-white border-kastom-border/50' 
                    : 'bg-kastom-green-bg border-kastom-green/20'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${notification.read ? 'text-kastom-dark' : 'text-kastom-dark'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-kastom-muted mt-1">{notification.message}</p>
                        <p className="text-xs text-kastom-muted/60 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('en-PG', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-kastom-green hover:underline text-sm whitespace-nowrap"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        className="inline-block mt-2 text-sm text-kastom-green hover:underline font-medium"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;