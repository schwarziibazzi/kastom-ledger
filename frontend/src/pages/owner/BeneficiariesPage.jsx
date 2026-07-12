import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  X,
  User,
  Eye,
  Search,
  Loader2,
  Mail,
  Send,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiariesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [estates, setEstates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    estateId: '',
    userId: '',
    name: '',
    email: '',
    relationship: '',
    customRelationship: '',
    sharePercentage: ''
  });

  const relationshipOptions = [
    'Son',
    'Daughter',
    'Spouse',
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Grandchild',
    'Nephew',
    'Niece',
    'Cousin',
    'Uncle',
    'Aunt',
    'Elder',
    'Trusted Friend',
    'Community Leader',
    'Other'
  ];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
      fetchSystemUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [beneficiariesRes, estatesRes] = await Promise.all([
        api.get('/beneficiaries'),
        api.get('/estates')
      ]);
      setBeneficiaries(beneficiariesRes.data.beneficiaries || []);
      setEstates(estatesRes.data.estates || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const users = response.data.users.filter(u => u.id !== user?.id);
      setSystemUsers(users);
    } catch (error) {
      console.error('Fetch users error:', error);
      try {
        const mockResponse = await api.get('/auth/mock-users');
        const mockUsers = mockResponse.data.users.map(u => ({
          id: u.uid,
          name: u.name,
          province: u.province,
          sevispassUid: u.uid,
          role: 'BENEFICIARY'
        }));
        setSystemUsers(mockUsers.filter(u => u.id !== user?.sevispassUid));
      } catch (fallbackError) {
        console.error('Fallback fetch error:', fallbackError);
        setSystemUsers([
          { id: 'MOCK-UID-002', name: 'Mary Wama', province: 'Morobe Province', sevispassUid: 'MOCK-UID-002' },
          { id: 'MOCK-UID-003', name: 'Peter Tau', province: 'Eastern Highlands Province', sevispassUid: 'MOCK-UID-003' },
          { id: 'MOCK-UID-004', name: 'Sarah Kila', province: 'West New Britain Province', sevispassUid: 'MOCK-UID-004' }
        ]);
      }
    }
  };

  const handleCreateBeneficiary = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let userId = newBeneficiary.userId;

      // If no userId and user not found in system, use the name and email
      if (!userId && newBeneficiary.name) {
        const existingUser = systemUsers.find(u => 
          u.name.toLowerCase() === newBeneficiary.name.toLowerCase()
        );
        
        if (existingUser) {
          userId = existingUser.id;
        }
        // If not found, we'll send invitation
      }

      const payload = {
        estateId: newBeneficiary.estateId,
        userId: userId || null,
        name: newBeneficiary.name,
        email: newBeneficiary.email || null,
        relationship: newBeneficiary.relationship === 'Other' 
          ? newBeneficiary.customRelationship 
          : newBeneficiary.relationship,
        sharePercentage: newBeneficiary.sharePercentage
      };
      
      const response = await api.post('/beneficiaries', payload);
      
      if (response.data.needsInvitation) {
        toast.success('Beneficiary added! Invitation will be sent to their email.');
      } else {
        toast.success('Beneficiary added successfully!');
      }
      
      setShowCreateModal(false);
      setNewBeneficiary({
        estateId: '',
        userId: '',
        name: '',
        email: '',
        relationship: '',
        customRelationship: '',
        sharePercentage: ''
      });
      setSelectedUser(null);
      setShowUserSearch(false);
      fetchData();
    } catch (error) {
      console.error('Add beneficiary error:', error);
      toast.error(error.response?.data?.message || 'Failed to add beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewBeneficiary({
      ...newBeneficiary,
      userId: user.id,
      name: user.name,
      email: user.email || ''
    });
    setShowUserSearch(false);
    setSearchTerm('');
  };

  const handleNameChange = (value) => {
    setNewBeneficiary({
      ...newBeneficiary,
      name: value,
      userId: ''
    });
    setSelectedUser(null);
    
    const match = systemUsers.find(u => 
      u.name.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      setSelectedUser(match);
      setNewBeneficiary(prev => ({
        ...prev,
        userId: match.id,
        email: match.email || ''
      }));
    }
  };

  const handleResendInvitation = async (id) => {
    try {
      await api.post(`/beneficiaries/${id}/resend`);
      toast.success('Invitation resent successfully');
    } catch (error) {
      toast.error('Failed to resend invitation');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'accepted': 'badge-success',
      'declined': 'badge-warning'
    };
    return badges[status] || 'badge-muted';
  };

  const getStatusIcon = (status) => {
    if (status === 'accepted') return <CheckCircle className="w-3 h-3 mr-1" />;
    if (status === 'declined') return <X className="w-3 h-3 mr-1" />;
    return <Clock className="w-3 h-3 mr-1" />;
  };

  const filteredUsers = systemUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.sevispassUid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-kastom-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Beneficiaries</h1>
          <p className="text-kastom-muted mt-1">Manage your estate beneficiaries</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Beneficiary
        </button>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-kastom-muted" />
          </div>
          <p className="text-kastom-muted font-medium">No beneficiaries added</p>
          <p className="text-sm text-kastom-muted/60 mt-1">Start by adding beneficiaries to your estate</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Beneficiary
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {beneficiaries.map((beneficiary) => (
            <motion.div
              key={beneficiary.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-kastom-border/50 hover:border-kastom-green/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-kastom-green/10 flex items-center justify-center">
                  {beneficiary.user ? (
                    <User className="w-6 h-6 text-kastom-green" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-kastom-dark">
                    {beneficiary.name || beneficiary.user?.name || 'Unknown'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-kastom-muted">
                    <span>{beneficiary.relationship}</span>
                    <span>•</span>
                    <span>{beneficiary.sharePercentage || 'No'}% share</span>
                    <span>•</span>
                    <span className="text-xs">{beneficiary.estate?.title}</span>
                    {!beneficiary.user && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pending Invitation
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusBadge(beneficiary.status)}`}>
                  {getStatusIcon(beneficiary.status)}
                  {beneficiary.status}
                </span>
                <button 
                  onClick={() => navigate(`/beneficiaries/${beneficiary.id}`)}
                  className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
                >
                  <Eye className="w-4 h-4 text-kastom-muted" />
                </button>
                {!beneficiary.user && beneficiary.status === 'pending' && (
                  <button 
                    onClick={() => handleResendInvitation(beneficiary.id)}
                    className="text-kastom-green hover:underline text-sm font-medium inline-flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Resend Invite
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-premium-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-kastom-dark">Add Beneficiary</h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setShowUserSearch(false);
                  setSearchTerm('');
                }} 
                className="p-2 rounded-lg hover:bg-kastom-cream transition-colors"
              >
                <X className="w-5 h-5 text-kastom-muted" />
              </button>
            </div>

            <form onSubmit={handleCreateBeneficiary}>
              {/* Estate Selection */}
              <div className="mb-4">
                <label className="input-label">Estate *</label>
                <select
                  value={newBeneficiary.estateId}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, estateId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select an estate</option>
                  {estates.map((estate) => (
                    <option key={estate.id} value={estate.id}>
                      {estate.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Beneficiary Name */}
              <div className="mb-4">
                <label className="input-label">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newBeneficiary.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => setShowUserSearch(true)}
                    className="input-field"
                    placeholder="Enter beneficiary full name..."
                    required
                  />
                  {showUserSearch && searchTerm.length > 0 && filteredUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-kastom-border rounded-xl shadow-premium-lg z-10 max-h-48 overflow-y-auto">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="w-full text-left px-4 py-2 hover:bg-kastom-cream transition-colors flex items-center justify-between"
                        >
                          <span>{u.name}</span>
                          <span className="text-xs text-kastom-muted">{u.sevispassUid}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="mt-2 text-xs text-kastom-green flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      User found in system: {selectedUser.name}
                    </div>
                  )}
                  {newBeneficiary.name && !selectedUser && (
                    <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      User not found. Invitation will be sent via email.
                    </div>
                  )}
                </div>
              </div>

              {/* Email - Required if user not found */}
              {!selectedUser && (
                <div className="mb-4 animate-fadeIn">
                  <label className="input-label">
                    Email Address *
                    <span className="text-xs text-kastom-muted/60 ml-1">(Required for sending invitation)</span>
                  </label>
                  <input
                    type="email"
                    value={newBeneficiary.email}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, email: e.target.value })}
                    className="input-field"
                    placeholder="beneficiary@email.com"
                    required={!selectedUser}
                  />
                </div>
              )}

              {/* Relationship */}
              <div className="mb-4">
                <label className="input-label">Relationship *</label>
                <select
                  value={newBeneficiary.relationship}
                  onChange={(e) => {
                    setNewBeneficiary({ 
                      ...newBeneficiary, 
                      relationship: e.target.value,
                      customRelationship: e.target.value === 'Other' ? '' : newBeneficiary.customRelationship
                    });
                  }}
                  className="input-field"
                  required
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Relationship */}
              {newBeneficiary.relationship === 'Other' && (
                <div className="mb-4 animate-fadeIn">
                  <label className="input-label">Specify Relationship *</label>
                  <input
                    type="text"
                    value={newBeneficiary.customRelationship}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, customRelationship: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Family Friend, Business Partner"
                    required
                  />
                </div>
              )}

              {/* Share Percentage */}
              <div className="mb-6">
                <label className="input-label">Share Percentage</label>
                <input
                  type="number"
                  value={newBeneficiary.sharePercentage}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, sharePercentage: e.target.value })}
                  className="input-field"
                  placeholder="25"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-kastom-muted/60 mt-1">
                  Leave blank if not applicable or if shares are not percentage-based.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      {!selectedUser ? (
                        <>
                          <Mail className="w-4 h-4" />
                          Add & Send Invite
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Add Beneficiary
                        </>
                      )}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowUserSearch(false);
                    setSearchTerm('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default BeneficiariesPage;