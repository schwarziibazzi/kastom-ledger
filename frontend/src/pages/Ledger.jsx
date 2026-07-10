import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Hash,
  ArrowDown,
  User,
  FileText,
  Users,
  UserCheck,
  Lock,
  Unlock,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const [ledgerRes, statsRes] = await Promise.all([
        api.get('/ledger'),
        api.get('/ledger/stats')
      ]);

      setEntries(ledgerRes.data.ledger?.entries || []);
      setVerification(ledgerRes.data.ledger?.integrity || null);
      setStats(statsRes.data.stats || {});
    } catch (error) {
      console.error('Fetch ledger error:', error);
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    const icons = {
      'USER_LOGIN': User,
      'LEGACY_PROFILE_CREATED': FileText,
      'LEGACY_PROFILE_UPDATED': FileText,
      'LEGACY_ITEM_ADDED': FileText,
      'SUCCESSOR_NOMINATED': Users,
      'SUCCESSOR_STATUS_UPDATED': Users,
      'WITNESS_REQUESTED': UserCheck,
      'WITNESS_APPROVED': CheckCircle,
      'SUCCESSION_STARTED': Activity,
      'DEATH_VERIFIED': Lock,
      'SUCCESSION_ACCESS_GRANTED': Unlock
    };
    return icons[actionType] || Clock;
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('CREATED') || actionType.includes('ADDED')) return 'text-kastom-green';
    if (actionType.includes('VERIFIED') || actionType.includes('APPROVED')) return 'text-kastom-success';
    if (actionType.includes('LOGIN')) return 'text-blue-600';
    return 'text-kastom-muted';
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

  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    return hash.substring(0, 10) + '...' + hash.substring(hash.length - 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Ledger Timeline</h1>
          <p className="text-kastom-muted mt-1">Immutable record of your legacy journey</p>
        </div>
        {verification && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            verification.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            {verification.isValid ? (
              <CheckCircle className="w-5 h-5 text-kastom-success" />
            ) : (
              <XCircle className="w-5 h-5 text-kastom-danger" />
            )}
            <span className={`text-sm font-medium ${
              verification.isValid ? 'text-kastom-success' : 'text-kastom-danger'
            }`}>
              {verification.isValid ? 'Chain Verified' : 'Integrity Issue'}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-2xl font-bold text-kastom-dark">{stats.totalEntries || 0}</p>
            <p className="text-sm text-kastom-muted">Total Entries</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-kastom-green">{stats.uniqueActors || 0}</p>
            <p className="text-sm text-kastom-muted">Unique Actors</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-kastom-dark">{Object.keys(stats.actions || {}).length}</p>
            <p className="text-sm text-kastom-muted">Action Types</p>
          </div>
          <div className="card">
            <p className="text-2xl font-bold text-kastom-green">{entries.length}</p>
            <p className="text-sm text-kastom-muted">Your Entries</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-kastom-muted" />
            </div>
            <p className="text-kastom-muted font-medium">No ledger entries yet</p>
            <p className="text-sm text-kastom-muted/60 mt-1">Start building your legacy to create a timeline</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-kastom-border/50"></div>
            
            <div className="space-y-0">
              {entries.map((entry, index) => {
                const Icon = getActionIcon(entry.actionType);
                const color = getActionColor(entry.actionType);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-16 pb-8 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-white border-2 border-kastom-green"></div>
                    
                    {/* Card */}
                    <div className="card card-hover">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-kastom-green-bg flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-kastom-dark">
                              {entry.actionType.replace(/_/g, ' ')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-kastom-muted mt-1">
                              <span>{formatDate(entry.timestamp)}</span>
                              <span>•</span>
                              <span className="font-mono text-xs">{entry.actorUid}</span>
                              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-xs text-kastom-muted/60">
                                    {Object.entries(entry.metadata)
                                      .filter(([key]) => key !== 'timestamp')
                                      .slice(0, 2)
                                      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
                                      .join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-kastom-muted/60">
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{truncateHash(entry.currentHash)}</span>
                          </div>
                          {entry.previousHash && (
                            <ArrowDown className="w-3 h-3 text-kastom-border" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ledger;