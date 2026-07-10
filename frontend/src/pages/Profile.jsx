import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle, 
  Edit2,
  Save,
  X,
  Lock,
  Key,
  Globe,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    culturalNotes: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.user;
      setProfile(userData);
      if (userData.legacyProfile) {
        setFormData({
          title: userData.legacyProfile.title || '',
          description: userData.legacyProfile.description || '',
          culturalNotes: userData.legacyProfile.culturalNotes || ''
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profile?.legacyProfile?.id) {
        await api.put(`/legacy/profile/${profile.legacyProfile.id}`, formData);
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-kastom-dark mb-8 tracking-tight">Profile</h1>

      {/* User Info */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-kastom-green flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-3xl">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-kastom-dark">{user?.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-kastom-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user?.province}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-PG') : 'N/A'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-kastom-green">
                    <CheckCircle className="w-4 h-4" />
                    SevisPass Verified
                  </span>
                </div>
                <p className="text-xs text-kastom-muted/60 font-mono mt-2">
                  UID: {user?.sevispassUid}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 bg-green-50 text-kastom-success px-3 py-1 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-kastom-green" />
            <h3 className="font-semibold text-kastom-dark">Security</h3>
          </div>
          <p className="text-sm text-kastom-muted">SevisPass authenticated</p>
          <p className="text-xs text-kastom-muted/60 mt-1">Identity verified through PNG government</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-kastom-green" />
            <h3 className="font-semibold text-kastom-dark">Member Since</h3>
          </div>
          <p className="text-sm text-kastom-muted">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-PG', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Legacy Profile */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-kastom-dark">Legacy Profile</h2>
          {!editing && profile?.legacyProfile && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 text-kastom-green hover:underline font-medium text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label className="input-label">Profile Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="mb-4">
              <label className="input-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>

            <div className="mb-6">
              <label className="input-label">Cultural Notes</label>
              <textarea
                value={formData.culturalNotes}
                onChange={(e) => setFormData({ ...formData, culturalNotes: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    title: profile?.legacyProfile?.title || '',
                    description: profile?.legacyProfile?.description || '',
                    culturalNotes: profile?.legacyProfile?.culturalNotes || ''
                  });
                }}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            {profile?.legacyProfile ? (
              <div>
                <h3 className="text-lg font-semibold text-kastom-dark">
                  {profile.legacyProfile.title}
                </h3>
                {profile.legacyProfile.description && (
                  <p className="text-kastom-muted mt-3 leading-relaxed">
                    {profile.legacyProfile.description}
                  </p>
                )}
                {profile.legacyProfile.culturalNotes && (
                  <div className="mt-4 p-4 bg-kastom-green-bg rounded-xl border border-kastom-green/10">
                    <h4 className="font-medium text-sm text-kastom-dark flex items-center gap-2">
                      <Globe className="w-4 h-4 text-kastom-green" />
                      Cultural Notes
                    </h4>
                    <p className="text-kastom-muted text-sm mt-1 leading-relaxed">
                      {profile.legacyProfile.culturalNotes}
                    </p>
                  </div>
                )}
                <p className="text-xs text-kastom-muted/60 mt-4">
                  Created: {new Date(profile.legacyProfile.createdAt).toLocaleDateString('en-PG', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-kastom-cream flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-kastom-muted" />
                </div>
                <p className="text-kastom-muted font-medium">No legacy profile yet</p>
                <button
                  onClick={() => window.location.href = '/legacy'}
                  className="mt-4 btn-primary inline-flex items-center gap-2 text-sm"
                >
                  Create Your Legacy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;