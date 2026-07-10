import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Ban,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'OWNER': 'bg-green-100 text-green-800',
      'BENEFICIARY': 'bg-blue-100 text-blue-800',
      'WITNESS': 'bg-purple-100 text-purple-800',
      'ADMINISTRATOR': 'bg-red-100 text-red-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    return status === 'verified' ? 'badge-success' : 'badge-pending';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.sevispassUid?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
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
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Users</h1>
        <p className="text-kastom-muted mt-1">Manage all users on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kastom-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or UID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Roles</option>
          <option value="OWNER">Owners</option>
          <option value="BENEFICIARY">Beneficiaries</option>
          <option value="WITNESS">Witnesses</option>
          <option value="ADMINISTRATOR">Administrators</option>
        </select>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-kastom-muted">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-kastom-muted mx-auto mb-4" />
            <p className="text-kastom-muted font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-kastom-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-kastom-muted">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kastom-muted">UID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kastom-muted">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kastom-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-kastom-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-kastom-border/30 last:border-0 hover:bg-kastom-cream/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-kastom-green/10 flex items-center justify-center">
                          <span className="text-kastom-green font-semibold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-kastom-dark">{user.name}</p>
                          <p className="text-xs text-kastom-muted">{user.province}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-kastom-muted">{user.sevispassUid}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(user.verificationStatus)}`}>
                        {user.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-kastom-cream transition-colors">
                          <Edit className="w-4 h-4 text-kastom-muted" />
                        </button>
                        {user.role !== 'ADMINISTRATOR' && (
                          <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Ban className="w-4 h-4 text-kastom-danger" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;